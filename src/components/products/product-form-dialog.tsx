"use client";

import * as React from "react";
import { X, Plus, Package, Calculator, TrendingUp } from "lucide-react";
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

export function ProductFormDialog({
  isOpen,
  onClose,
  onSuccess,
  initialProduct,
}: ProductFormDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<ProductInput>({
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

  React.useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name,
        sku: initialProduct.sku || "",
        selling_price: initialProduct.selling_price,
        product_cost: initialProduct.product_cost,
        packaging_cost: initialProduct.packaging_cost,
        delivery_cost: initialProduct.delivery_cost,
        return_cost: initialProduct.return_cost,
        other_fulfillment_cost: initialProduct.other_fulfillment_cost,
        target_cpl: initialProduct.target_cpl,
        expected_delivery_rate: initialProduct.expected_delivery_rate,
        lead_capacity: initialProduct.lead_capacity,
        status: initialProduct.status as ProductStatus,
        notes: initialProduct.notes || "",
      });
    }
  }, [initialProduct]);

  if (!isOpen) return null;

  // Live Unit Economics Calculation
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {initialProduct ? "Edit Product & Economics" : "Create New Product"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Configure selling price, supplier costs, delivery assumptions &amp; targets
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Product Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Product Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ergonomic Lumbar Cushion Pro"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                SKU (Internal Code)
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

          {/* Core Price & Supplier Cost */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Selling Price (DT)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.selling_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selling_price: parseFloat(e.target.value) || 0,
                  })
                }
                required
                className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Product Cost (DT)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.product_cost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    product_cost: parseFloat(e.target.value) || 0,
                  })
                }
                required
                className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Packaging (DT)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.packaging_cost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    packaging_cost: parseFloat(e.target.value) || 0,
                  })
                }
                required
                className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Delivery Cost (DT)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.delivery_cost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    delivery_cost: parseFloat(e.target.value) || 0,
                  })
                }
                required
                className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Operational Assumptions & Targets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Return Cost (DT)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.return_cost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    return_cost: parseFloat(e.target.value) || 0,
                  })
                }
                required
                className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Target CPL (DT)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.target_cpl}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target_cpl: parseFloat(e.target.value) || 0,
                  })
                }
                required
                className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Expected Deliv %
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="1.0"
                value={formData.expected_delivery_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expected_delivery_rate: parseFloat(e.target.value) || 0.65,
                  })
                }
                required
                className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Lead Capacity / Day
              </label>
              <input
                type="number"
                value={formData.lead_capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lead_capacity: parseInt(e.target.value) || 50,
                  })
                }
                required
                className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
              />
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
                Assumes {formatPercent(formData.expected_delivery_rate)} delivery rate
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-2 bg-surface rounded border border-border">
                <span className="text-[10px] uppercase text-muted-foreground block font-mono">
                  Gross Profit
                </span>
                <span className="text-xs font-mono font-bold text-foreground tabular-nums">
                  {formatCurrency(economics.grossProfit)}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  ({formatPercent(economics.grossMarginRate)} margin)
                </span>
              </div>

              <div className="p-2 bg-surface rounded border border-border">
                <span className="text-[10px] uppercase text-muted-foreground block font-mono">
                  Return Cost Load
                </span>
                <span className="text-xs font-mono font-bold text-foreground tabular-nums">
                  {formatCurrency(economics.returnCostLoadPerDelivered)}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  per delivered unit
                </span>
              </div>

              <div className="p-2 bg-surface rounded border border-border">
                <span className="text-[10px] uppercase text-muted-foreground block font-mono">
                  Est. Net Profit / Deliv
                </span>
                <span
                  className={`text-xs font-mono font-bold tabular-nums ${
                    economics.estimatedNetProfitPerDeliveredOrder >= 10
                      ? "text-emerald-400"
                      : economics.estimatedNetProfitPerDeliveredOrder > 0
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {formatCurrency(economics.estimatedNetProfitPerDeliveredOrder)}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  ({formatPercent(economics.netMarginRate)} net)
                </span>
              </div>

              <div className="p-2 bg-surface rounded border border-border">
                <span className="text-[10px] uppercase text-muted-foreground block font-mono">
                  Break-Even CPL
                </span>
                <span className="text-xs font-mono font-bold text-foreground tabular-nums">
                  {formatCurrency(economics.breakEvenCPL)}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  max allowable CPL
                </span>
              </div>
            </div>
          </div>

          {/* Status, Notes & Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Lifecycle Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ProductStatus,
                  })
                }
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none"
              >
                <option value="IDEA">IDEA</option>
                <option value="RESEARCH">RESEARCH</option>
                <option value="READY">READY</option>
                <option value="TESTING">TESTING</option>
                <option value="HOLD">HOLD</option>
                <option value="KILL">KILL</option>
                <option value="WINNER">WINNER</option>
                <option value="SCALING">SCALING</option>
                <option value="FATIGUED">FATIGUED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Internal Operational Notes
              </label>
              <input
                type="text"
                placeholder="Supplier contact, restock lead times..."
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer */}
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
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? "Saving..." : initialProduct ? "Update Product" : "Save Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
