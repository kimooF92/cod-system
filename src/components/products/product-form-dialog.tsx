"use client";

import * as React from "react";
import { X, Plus, Package, Calculator, ChevronRight, ChevronLeft, AlertTriangle, Sliders } from "lucide-react";
import { calculateUnitEconomics } from "@/lib/engine/unit-economics";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { createProduct, updateProduct, type Product } from "@/actions/products";
import type { ProductInput, ProductStatus } from "@/lib/validations/product";

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialProduct?: Product | null;
}

const DESTRUCTIVE_STATUSES = ["KILL", "ARCHIVED"];

const STATUS_OPTIONS: { value: ProductStatus; label: string; color: string }[] = [
  { value: "IDEA", label: "IDEA", color: "text-muted-foreground" },
  { value: "RESEARCH", label: "RESEARCH", color: "text-blue-400" },
  { value: "READY", label: "READY", color: "text-blue-400" },
  { value: "TESTING", label: "TESTING", color: "text-amber-400" },
  { value: "WINNER", label: "WINNER", color: "text-emerald-400" },
  { value: "SCALING", label: "SCALING", color: "text-emerald-400" },
  { value: "HOLD", label: "HOLD", color: "text-amber-400" },
  { value: "FATIGUED", label: "FATIGUED", color: "text-orange-400" },
  { value: "KILL", label: "KILL ⚠️", color: "text-red-400" },
  { value: "ARCHIVED", label: "ARCHIVED", color: "text-muted-foreground" },
];

export function ProductFormDialog({
  isOpen,
  onClose,
  onSuccess,
  initialProduct,
}: ProductFormDialogProps) {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingDestructiveStatus, setPendingDestructiveStatus] =
    React.useState<ProductStatus | null>(null);

  const defaultData: ProductInput = {
    name: initialProduct?.name || "",
    sku: initialProduct?.sku || "",
    selling_price: initialProduct?.selling_price || 59.0,
    product_cost: initialProduct?.product_cost || 18.0,
    packaging_cost: initialProduct?.packaging_cost || 1.5,
    delivery_cost: initialProduct?.delivery_cost || 7.0,
    return_cost: initialProduct?.return_cost || 3.5,
    other_fulfillment_cost: initialProduct?.other_fulfillment_cost || 0.0,
    target_cpl: initialProduct?.target_cpl || 4.0,
    expected_delivery_rate: initialProduct?.expected_delivery_rate || 0.65,
    lead_capacity: initialProduct?.lead_capacity || 50,
    status: (initialProduct?.status as ProductStatus) || "READY",
    notes: initialProduct?.notes || "",
  };

  const [formData, setFormData] = React.useState<ProductInput>(defaultData);

  React.useEffect(() => {
    if (isOpen) {
      // Reset to step 1 on each open (unless editing)
      if (!initialProduct) setStep(1);
      else setStep(2);

      setFormData({
        name: initialProduct?.name || "",
        sku: initialProduct?.sku || "",
        selling_price: initialProduct?.selling_price || 59.0,
        product_cost: initialProduct?.product_cost || 18.0,
        packaging_cost: initialProduct?.packaging_cost || 1.5,
        delivery_cost: initialProduct?.delivery_cost || 7.0,
        return_cost: initialProduct?.return_cost || 3.5,
        other_fulfillment_cost: initialProduct?.other_fulfillment_cost || 0.0,
        target_cpl: initialProduct?.target_cpl || 4.0,
        expected_delivery_rate: initialProduct?.expected_delivery_rate || 0.65,
        lead_capacity: initialProduct?.lead_capacity || 50,
        status: (initialProduct?.status as ProductStatus) || "READY",
        notes: initialProduct?.notes || "",
      });
      setError(null);
      setPendingDestructiveStatus(null);
    }
  }, [isOpen, initialProduct]);

  if (!isOpen) return null;

  // Live Unit Economics
  const economics = calculateUnitEconomics({
    sellingPrice: formData.selling_price,
    productCost: formData.product_cost,
    packagingCost: formData.packaging_cost,
    deliveryCost: formData.delivery_cost,
    returnCost: formData.return_cost,
    otherCost: formData.other_fulfillment_cost,
    targetCpl: formData.target_cpl,
    expectedDeliveryRate: formData.expected_delivery_rate,
  });

  const handleStatusChange = (value: string) => {
    const status = value as ProductStatus;
    if (DESTRUCTIVE_STATUSES.includes(status)) {
      setPendingDestructiveStatus(status);
    } else {
      setPendingDestructiveStatus(null);
      setFormData({ ...formData, status });
    }
  };

  const confirmDestructiveStatus = () => {
    if (pendingDestructiveStatus) {
      setFormData({ ...formData, status: pendingDestructiveStatus });
      setPendingDestructiveStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = initialProduct
      ? await updateProduct(initialProduct.id, formData)
      : await createProduct(formData);

    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Failed to save product");
    }
  };

  const canProceedStep1 = formData.name.trim().length > 0 && formData.selling_price > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {initialProduct ? "Edit Product" : "Create New Product"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {initialProduct
                  ? "Update pricing, costs & assumptions"
                  : step === 1
                  ? "Step 1 of 2 — Core info & pricing"
                  : "Step 2 of 2 — Cost structure & targets"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Step indicator */}
            {!initialProduct && (
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${step === 1 ? "bg-blue-500" : "bg-emerald-500"}`} />
                <div className={`w-2 h-2 rounded-full ${step === 2 ? "bg-blue-500" : "bg-border"}`} />
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* ── STEP 1: Core Identity ── */}
          {step === 1 && (
            <>
              {/* Name + SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Product Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ergonomic Lumbar Cushion Pro"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    autoFocus
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    SKU (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CUSH-01"
                    value={formData.sku || ""}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Price + Cost (the 2 most critical) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Selling Price (DT) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.selling_price}
                    onChange={(e) =>
                      setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })
                    }
                    required
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Product Cost (DT) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.product_cost}
                    onChange={(e) =>
                      setFormData({ ...formData, product_cost: parseFloat(e.target.value) || 0 })
                    }
                    required
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Live Economics preview — appears after entering both prices */}
              {formData.selling_price > 0 && formData.product_cost > 0 && (
                <div className="p-4 rounded-lg bg-surface-subtle border border-border">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-3">
                    <Calculator className="w-3.5 h-3.5 text-blue-400" />
                    <span>Live Economics Preview</span>
                    <span className="ml-auto text-[10px] font-mono">using defaults for step 2</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2 bg-surface rounded border border-border text-center">
                      <span className="text-[10px] uppercase text-muted-foreground block font-mono">Gross Profit</span>
                      <span className="text-sm font-mono font-bold text-foreground tabular-nums">
                        {formatCurrency(economics.grossProfit)}
                      </span>
                    </div>
                    <div className="p-2 bg-surface rounded border border-border text-center">
                      <span className="text-[10px] uppercase text-muted-foreground block font-mono">Net / Order</span>
                      <span className={`text-sm font-mono font-bold tabular-nums ${economics.estimatedNetProfitPerDeliveredOrder >= 10 ? "text-emerald-400" : economics.estimatedNetProfitPerDeliveredOrder > 0 ? "text-amber-400" : "text-red-400"}`}>
                        {formatCurrency(economics.estimatedNetProfitPerDeliveredOrder)}
                      </span>
                    </div>
                    <div className="p-2 bg-surface rounded border border-border text-center">
                      <span className="text-[10px] uppercase text-muted-foreground block font-mono">Break-even CPL</span>
                      <span className="text-sm font-mono font-bold text-foreground tabular-nums">
                        {formatCurrency(economics.breakEvenCPL)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1 footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium transition-colors shadow-sm"
                >
                  <span>Set Economics & Targets</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: Cost Structure & Targets ── */}
          {step === 2 && (
            <>
              {/* Quick reference: name from step 1 */}
              {!initialProduct && (
                <div className="flex items-center gap-2 p-2.5 rounded-md bg-blue-500/5 border border-blue-500/15 text-xs text-blue-400">
                  <Package className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-semibold truncate">{formData.name}</span>
                  <span className="text-muted-foreground">·</span>
                  <span>{formatCurrency(formData.selling_price)}</span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="ml-auto flex items-center gap-1 text-[10px] hover:text-blue-300"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Edit
                  </button>
                </div>
              )}

              {/* Costs row */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Sliders className="w-3 h-3" /> Fulfillment Costs (DT)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((d) => ({
                        ...d,
                        packaging_cost: 1.5,
                        delivery_cost: 7.0,
                        return_cost: 3.5,
                        other_fulfillment_cost: 0.0,
                      }))
                    }
                    className="text-[10px] font-mono text-blue-400 hover:text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded"
                  >
                    Use Tunisia defaults
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Packaging", key: "packaging_cost" as const, step: 0.1 },
                    { label: "Delivery", key: "delivery_cost" as const, step: 0.5 },
                    { label: "Return cost", key: "return_cost" as const, step: 0.5 },
                    { label: "Other", key: "other_fulfillment_cost" as const, step: 0.5 },
                  ].map(({ label, key, step: s }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] text-muted-foreground">{label}</label>
                      <input
                        type="number"
                        step={s}
                        min={0}
                        value={formData[key]}
                        onChange={(e) =>
                          setFormData({ ...formData, [key]: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Targets row */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">
                  Ad & Operations Targets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground">Target CPL (DT)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.target_cpl}
                      onChange={(e) =>
                        setFormData({ ...formData, target_cpl: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground">
                      Expected Delivery Rate: {Math.round(formData.expected_delivery_rate * 100)}%
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={95}
                      step={5}
                      value={Math.round(formData.expected_delivery_rate * 100)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expected_delivery_rate: parseInt(e.target.value) / 100,
                        })
                      }
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
                      <span>10%</span><span>50%</span><span>95%</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground">Lead Capacity / Day</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.lead_capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, lead_capacity: parseInt(e.target.value) || 50 })
                      }
                      className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Live Unit Economics Breakdown Box */}
              <div className="p-4 rounded-lg bg-surface-subtle border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calculator className="w-3.5 h-3.5 text-blue-400" />
                    <span>Simulated Unit Economics (Per Delivered Order)</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {formatPercent(formData.expected_delivery_rate)} delivery rate
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {[
                    { label: "Gross Profit", value: formatCurrency(economics.grossProfit), sub: `(${formatPercent(economics.grossMarginRate)} margin)`, color: "text-foreground" },
                    { label: "Return Load", value: formatCurrency(economics.returnCostLoadPerDelivered), sub: "per delivered unit", color: "text-foreground" },
                    {
                      label: "Net / Delivered",
                      value: formatCurrency(economics.estimatedNetProfitPerDeliveredOrder),
                      sub: `(${formatPercent(economics.netMarginRate)} net)`,
                      color: economics.estimatedNetProfitPerDeliveredOrder >= 10 ? "text-emerald-400" : economics.estimatedNetProfitPerDeliveredOrder > 0 ? "text-amber-400" : "text-red-400",
                    },
                    { label: "Break-Even CPL", value: formatCurrency(economics.breakEvenCPL), sub: "max allowable CPL", color: "text-foreground" },
                  ].map((item) => (
                    <div key={item.label} className="p-2 bg-surface rounded border border-border">
                      <span className="text-[10px] uppercase text-muted-foreground block font-mono">{item.label}</span>
                      <span className={`text-xs font-mono font-bold tabular-nums ${item.color}`}>{item.value}</span>
                      <span className="text-[10px] text-muted-foreground block">{item.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status + Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Lifecycle Status
                  </label>
                  <select
                    value={pendingDestructiveStatus || formData.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>

                  {/* Destructive status confirmation */}
                  {pendingDestructiveStatus && (
                    <div className="p-2.5 rounded-md bg-red-500/10 border border-red-500/25 text-xs">
                      <div className="flex items-start gap-2 text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>
                          Setting status to <strong>{pendingDestructiveStatus}</strong> will
                          archive this product. Confirm?
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={confirmDestructiveStatus}
                          className="px-2 py-1 rounded text-[10px] bg-red-600 text-white font-medium hover:bg-red-700"
                        >
                          Yes, {pendingDestructiveStatus}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDestructiveStatus(null)}
                          className="px-2 py-1 rounded text-[10px] border border-border text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Internal Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Supplier contact, restock lead times..."
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                {!initialProduct ? (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || !!pendingDestructiveStatus}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{loading ? "Saving..." : initialProduct ? "Update Product" : "Save Product"}</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
