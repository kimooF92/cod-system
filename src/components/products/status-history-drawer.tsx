"use client";

import * as React from "react";
import { X, History, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { getProductStatusHistory, type ProductStatusHistory } from "@/actions/product-status";
import type { Product } from "@/actions/products";

interface StatusHistoryDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  WINNER: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  SCALING: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  TESTING: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  READY: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  HOLD: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  KILL: "text-red-400 bg-red-500/10 border-red-500/20",
  FATIGUED: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  ARCHIVED: "text-muted-foreground bg-surface-subtle border-border",
  IDEA: "text-muted-foreground bg-surface-subtle border-border",
  RESEARCH: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

export function StatusHistoryDrawer({
  product,
  isOpen,
  onClose,
}: StatusHistoryDrawerProps) {
  const [history, setHistory] = React.useState<ProductStatusHistory[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && product) {
      setLoading(true);
      getProductStatusHistory(product.id)
        .then((data) => setHistory(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border-l border-border w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Lifecycle Status Audit Trail
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                {product.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Log Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground bg-surface-subtle p-2.5 rounded border border-border">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Append-Only Immutability</span>
            </div>
            <span>{history.length} events logged</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground font-mono">
              Loading audit log...
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No historical status changes recorded yet for this product.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
              {history.map((event, idx) => {
                const date = new Date(event.created_at);
                const isLatest = idx === 0;

                return (
                  <div key={event.id} className="relative space-y-1.5">
                    {/* Bullet marker */}
                    <div
                      className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 bg-surface ${
                        isLatest ? "border-blue-500 bg-blue-500" : "border-muted-foreground"
                      }`}
                    />

                    {/* Status Badge Pair */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {event.previous_status ? (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            statusColors[event.previous_status] || "text-muted-foreground border-border"
                          }`}
                        >
                          {event.previous_status}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border text-muted-foreground">
                          NEW
                        </span>
                      )}

                      <ArrowRight className="w-3 h-3 text-muted-foreground" />

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                          statusColors[event.new_status] || "text-muted-foreground border-border"
                        }`}
                      >
                        {event.new_status}
                      </span>
                    </div>

                    {/* Reason Text */}
                    {event.reason && (
                      <p className="text-xs text-foreground bg-surface-subtle p-2.5 rounded border border-border/70">
                        {event.reason}
                      </p>
                    )}

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{format(date, "MMM d, yyyy 'at' HH:mm")}</span>
                      <span>&bull;</span>
                      <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-surface-subtle border border-border text-xs text-foreground hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
