"use client";

import * as React from "react";
import { X, Truck, Package, AlertCircle } from "lucide-react";
import { COURIER_PRESETS, type CourierPreset } from "@/lib/validations/order";
import { batchDispatchOrders, type Order } from "@/actions/orders";

interface BatchDispatchDialogProps {
  selectedOrders: Order[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BatchDispatchDialog({
  selectedOrders,
  isOpen,
  onClose,
  onSuccess,
}: BatchDispatchDialogProps) {
  const [courierName, setCourierName] = React.useState<string>("Aramex Tunisia");
  const [customCourier, setCustomCourier] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen || selectedOrders.length === 0) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalCourier = courierName === "Other" ? customCourier : courierName;
    if (!finalCourier) {
      setError("Please select or enter a courier name");
      setLoading(false);
      return;
    }

    try {
      const res = await batchDispatchOrders({
        order_ids: selectedOrders.map((o) => o.id),
        courier_name: finalCourier,
        notes: notes || null,
      });

      if (!res.success) {
        setError(res.error || "Failed to batch dispatch orders");
      } else {
        onSuccess();
        onClose();
      }
    } catch {
      setError("An unexpected error occurred during batch dispatch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Batch Dispatch Orders
              </h3>
              <p className="text-xs text-muted-foreground">
                Assign {selectedOrders.length} selected orders to courier
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Selected Order Summary */}
          <div className="p-3 bg-surface-subtle border border-border rounded-lg space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Orders to Dispatch:</span>
              <span className="font-mono font-semibold text-amber-400">
                {selectedOrders.length} orders
              </span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 pt-1 border-t border-border/50 text-[11px] font-mono text-muted-foreground">
              {selectedOrders.map((o) => (
                <div key={o.id} className="flex justify-between">
                  <span>{o.order_number}</span>
                  <span>{o.customer_name} ({o.governorate})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Courier Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Assign to Courier
            </label>
            <select
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {COURIER_PRESETS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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
                className="w-full bg-surface-subtle border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}

          {/* Dispatch Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Manifest / Dispatch Note (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Manifest batch #42 picked up at 3 PM"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Footer */}
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
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{loading ? "Dispatching..." : `Dispatch (${selectedOrders.length})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
