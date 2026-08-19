"use client";

import * as React from "react";
import {
  X,
  Truck,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Package,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  COURIER_PRESETS,
  RETURN_REASONS,
  type CourierPreset,
  type ReturnReason,
  type OrderStatus,
} from "@/lib/validations/order";
import { reconcileCourierDelivery, type Order } from "@/actions/orders";
import { formatCurrency } from "@/lib/utils";

interface CourierReconciliationDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CourierReconciliationDialog({
  order,
  isOpen,
  onClose,
  onSuccess,
}: CourierReconciliationDialogProps) {
  const [targetStatus, setTargetStatus] = React.useState<OrderStatus>("DISPATCHED");
  const [courierName, setCourierName] = React.useState<string>("Aramex Tunisia");
  const [customCourier, setCustomCourier] = React.useState("");
  const [trackingCode, setTrackingCode] = React.useState("");
  const [returnReason, setReturnReason] = React.useState<string>("Customer Refused on Delivery");
  const [customReturnReason, setCustomReturnReason] = React.useState("");
  const [returnFee, setReturnFee] = React.useState<number>(3.5);
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (order) {
      if (order.status === "CONFIRMED") {
        setTargetStatus("DISPATCHED");
      } else if (order.status === "DISPATCHED") {
        setTargetStatus("DELIVERED");
      } else {
        setTargetStatus((order.status as OrderStatus) || "DISPATCHED");
      }

      const presetMatch = COURIER_PRESETS.find((p) => p === order.courier_name);
      if (presetMatch) {
        setCourierName(presetMatch);
        setCustomCourier("");
      } else if (order.courier_name) {
        setCourierName("Other");
        setCustomCourier(order.courier_name);
      } else {
        setCourierName("Aramex Tunisia");
        setCustomCourier("");
      }

      setTrackingCode(order.tracking_code || "");
      setReturnReason(order.return_reason || "Customer Refused on Delivery");
      setReturnFee(order.return_fee ? Number(order.return_fee) : 3.5);
      setNotes(order.notes || "");
      setError(null);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalCourier = courierName === "Other" ? customCourier : courierName;
    const finalReason = returnReason === "Other" ? customReturnReason : returnReason;

    try {
      const res = await reconcileCourierDelivery(order.id, {
        status: targetStatus as any,
        courier_name: finalCourier || null,
        tracking_code: trackingCode || null,
        return_reason: targetStatus === "RETURNED" ? finalReason : null,
        return_fee: targetStatus === "RETURNED" ? returnFee : 3.5,
        notes: notes || null,
      });

      if (!res.success) {
        setError(res.error || "Failed to update order reconciliation");
      } else {
        onSuccess();
        onClose();
      }
    } catch {
      setError("An unexpected error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Courier Delivery &amp; Reconciliation
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {order.order_number} &bull; {order.customer_name} ({order.governorate})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Outcome Status Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Target Outcome Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetStatus("DISPATCHED")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                  targetStatus === "DISPATCHED"
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-sm"
                    : "bg-surface-subtle border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                <Truck className="w-4 h-4 mb-1" />
                <span>Dispatched</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetStatus("DELIVERED")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                  targetStatus === "DELIVERED"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm"
                    : "bg-surface-subtle border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mb-1" />
                <span>Delivered</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetStatus("RETURNED")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                  targetStatus === "RETURNED"
                    ? "bg-red-500/15 border-red-500/40 text-red-400 shadow-sm"
                    : "bg-surface-subtle border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                <RotateCcw className="w-4 h-4 mb-1" />
                <span>Returned</span>
              </button>
            </div>
          </div>

          {/* Courier Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Courier Company
              </label>
              <select
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {COURIER_PRESETS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Tracking Code / Manifest ID
              </label>
              <input
                type="text"
                placeholder="e.g. ARX-TN-10293"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="w-full font-mono bg-surface-subtle border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {courierName === "Other" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Custom Courier Name
              </label>
              <input
                type="text"
                placeholder="Enter courier name"
                value={customCourier}
                onChange={(e) => setCustomCourier(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Return-specific Fields */}
          {targetStatus === "RETURNED" && (
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
                <RotateCcw className="w-4 h-4" />
                <span>Return Reconciliation Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Return Reason
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full bg-surface-subtle border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    {RETURN_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Courier Return Fee (TND)
                  </label>
                  <input
                    type="number"
                    step="0.100"
                    min="0"
                    value={returnFee}
                    onChange={(e) => setReturnFee(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono bg-surface-subtle border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {returnReason === "Other" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Specific Return Reason
                  </label>
                  <input
                    type="text"
                    placeholder="Describe specific return reason"
                    value={customReturnReason}
                    onChange={(e) => setCustomReturnReason(e.target.value)}
                    className="w-full bg-surface-subtle border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Internal Reconciliation Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Courier confirmed delivery signature / Package refused at door..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Financial Summary Pill */}
          <div className="p-3 bg-surface-subtle border border-border rounded-lg flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">Order Total COD:</span>
            <span className="font-bold text-foreground tabular-nums">
              {formatCurrency(Number(order.total_amount))}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{loading ? "Updating..." : "Confirm Reconciliation"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
