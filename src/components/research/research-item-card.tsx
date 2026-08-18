"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { updateResearchStatus, deleteResearchItem, type ResearchItem } from "@/actions/research";
import { convertResearchToProduct } from "@/actions/products";
import type { ResearchStatus } from "@/lib/validations/research";
import { Sparkles, Trash2, ArrowRight } from "lucide-react";

interface ResearchItemCardProps {
  item: ResearchItem;
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  IDEA: "bg-surface-subtle text-muted-foreground border-border",
  VALIDATING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  READY_FOR_TEST: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-semibold",
  DISCARDED: "bg-red-500/10 text-red-400 border-red-500/20",
  CONVERTED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function ResearchItemCard({ item, onRefresh }: ResearchItemCardProps) {
  const router = useRouter();
  const [updating, setUpdating] = React.useState(false);
  const [converting, setConverting] = React.useState(false);

  const grossMargin =
    item.estimated_price > 0
      ? (item.estimated_price - item.estimated_cost) / item.estimated_price
      : null;

  const handleStatusChange = async (newStatus: ResearchStatus) => {
    setUpdating(true);
    await updateResearchStatus(item.id, newStatus);
    setUpdating(false);
    onRefresh();
  };

  const handleConvert = async () => {
    setConverting(true);
    const res = await convertResearchToProduct(item.id);
    setConverting(false);
    if (res.success) {
      onRefresh();
      router.push("/products");
    } else {
      alert(res.error || "Failed to convert research item to product");
    }
  };

  const handleDelete = async () => {
    if (confirm("Delete this research item?")) {
      await deleteResearchItem(item.id);
      onRefresh();
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-5 flex flex-col justify-between hover:border-muted-foreground/30 transition-all space-y-4">
      <div>
        {/* Card Header: Target Customer & Status */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-surface-subtle px-2 py-0.5 rounded border border-border">
              {item.market} &bull; {item.target_customer}
            </span>
            <h4 className="text-sm font-bold text-foreground mt-2 leading-tight">
              {item.problem}
            </h4>
          </div>

          {/* Quick Status Dropdown */}
          <select
            value={item.status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value as ResearchStatus)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono border focus:outline-none cursor-pointer ${
              statusColors[item.status] || statusColors.IDEA
            }`}
          >
            <option value="IDEA">IDEA</option>
            <option value="VALIDATING">VALIDATING</option>
            <option value="READY_FOR_TEST">READY FOR TEST</option>
            <option value="DISCARDED">DISCARDED</option>
            <option value="CONVERTED">CONVERTED</option>
          </select>
        </div>

        {/* Product Promise & Pain Point */}
        <div className="p-3 rounded-md bg-surface-subtle/70 border border-border/60 space-y-1.5 my-3">
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span>{item.promise}</span>
          </div>
          <p className="text-xs text-muted-foreground italic">
            &ldquo;{item.pain_point}&rdquo;
          </p>
        </div>

        {/* Creative Opportunities & Competitors if present */}
        {item.creative_opportunities && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            <strong className="text-foreground font-medium">Angle: </strong>
            {item.creative_opportunities}
          </p>
        )}
      </div>

      {/* Footer: Price, Cost, Margin %, and Delete */}
      <div className="pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] uppercase text-muted-foreground block font-mono">
              Price / Cost
            </span>
            <span className="text-xs font-mono font-semibold tabular-nums text-foreground">
              {formatCurrency(item.estimated_price)} / {formatCurrency(item.estimated_cost)}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-muted-foreground block font-mono">
              Est. Margin
            </span>
            <span
              className={`text-xs font-mono font-bold tabular-nums ${
                grossMargin && grossMargin >= 0.6
                  ? "text-emerald-400"
                  : grossMargin && grossMargin >= 0.4
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {formatPercent(grossMargin)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {item.status !== "CONVERTED" && (
            <button
              onClick={handleConvert}
              disabled={converting}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-medium transition-colors"
              title="Convert to Product without re-typing (FR-8)"
            >
              <span>{converting ? "Converting..." : "Convert to Product"}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={handleDelete}
            className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-surface-subtle rounded transition-colors"
            title="Delete Research Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
