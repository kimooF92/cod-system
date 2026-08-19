"use client";

import * as React from "react";
import { X, ShieldAlert, ArrowRight } from "lucide-react";
import { PRODUCT_STATUS_MAP, getStatusMetadata } from "@/lib/engine/state-machine";
import { updateProductStatusWithHistory } from "@/actions/product-status";
import type { Product } from "@/actions/products";
import type { ProductStatus } from "@/lib/validations/product";

interface StatusOverrideDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StatusOverrideDialog({
  product,
  isOpen,
  onClose,
  onSuccess,
}: StatusOverrideDialogProps) {
  const [selectedStatus, setSelectedStatus] = React.useState<ProductStatus>(
    (product?.status as ProductStatus) || "READY"
  );
  const [reason, setReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (product) {
      setSelectedStatus(product.status as ProductStatus);
      setReason("");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const currentMeta = getStatusMetadata(product.status as ProductStatus);
  const selectedMeta = getStatusMetadata(selectedStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === product.status) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    const res = await updateProductStatusWithHistory(
      product.id,
      selectedStatus,
      reason
    );

    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Failed to update product status");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Manual Status Override
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-xs">
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Transition Display */}
          <div className="p-3 rounded-lg bg-surface-subtle border border-border flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                Current Status
              </span>
              <span className="text-xs font-mono font-bold text-foreground">
                {currentMeta.label}
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground" />

            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                New Target Status
              </span>
              <span className="text-xs font-mono font-bold text-blue-400">
                {selectedMeta.label}
              </span>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Select Lifecycle Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ProductStatus)}
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {Object.keys(PRODUCT_STATUS_MAP).map((st) => (
                <option key={st} value={st}>
                  {st} — {PRODUCT_STATUS_MAP[st as ProductStatus].description}
                </option>
              ))}
            </select>
          </div>

          {/* Override Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Override Reason / Context (Recorded in Audit Log)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Completed 3 days of testing with 3.2 DT CPL and 72% confirmation rate"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-muted-foreground">
              Audit records are permanently preserved with timestamp for history tracking.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedStatus === product.status}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <span>{loading ? "Recording..." : "Commit Status Change"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
