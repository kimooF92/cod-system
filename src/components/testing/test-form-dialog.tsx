"use client";

import * as React from "react";
import { X, Plus, FlaskConical, Target, DollarSign } from "lucide-react";
import { createProductTest } from "@/actions/tests";
import { getProducts, type Product } from "@/actions/products";
import type { ProductTestInput } from "@/lib/validations/test";

interface TestFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TestFormDialog({
  isOpen,
  onClose,
  onSuccess,
}: TestFormDialogProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<ProductTestInput>({
    product_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: null,
    budget: 100.0,
    target_leads: 25,
    target_cpl: 4.0,
    expected_delivery_rate: 0.65,
    target_profit_per_order: 15.0,
    planned_creative_quantity: 3,
    notes: "",
    status: "RUNNING",
  });

  React.useEffect(() => {
    if (isOpen) {
      getProducts().then((data) => {
        setProducts(data);
        if (data.length > 0 && !formData.product_id) {
          const defaultProd = data[0];
          setFormData((prev) => ({
            ...prev,
            product_id: defaultProd.id,
            target_cpl: defaultProd.target_cpl,
            expected_delivery_rate: defaultProd.expected_delivery_rate,
          }));
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProductSelect = (productId: string) => {
    const selected = products.find((p) => p.id === productId);
    setFormData((prev) => ({
      ...prev,
      product_id: productId,
      target_cpl: selected ? selected.target_cpl : prev.target_cpl,
      expected_delivery_rate: selected
        ? selected.expected_delivery_rate
        : prev.expected_delivery_rate,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createProductTest(formData);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Failed to create testing campaign");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Launch Bounded Product Test
              </h3>
              <p className="text-xs text-muted-foreground">
                Define strict budget cap and benchmark targets to test market demand
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

          {/* Product Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Select Product to Test
            </label>
            <select
              value={formData.product_id}
              onChange={(e) => handleProductSelect(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="" disabled>
                -- Choose a product from catalog --
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku || "NO-SKU"}) &bull; {p.selling_price} DT
                </option>
              ))}
            </select>
          </div>

          {/* Budget & Target Leads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Budget Cap (Tunisian Dinar)
              </label>
              <input
                type="number"
                step="5.0"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: parseFloat(e.target.value) || 0,
                  })
                }
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-muted-foreground">
                Strict testing limit; recommended: 80–150 DT for initial signal.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Target Leads (Sample Size)
              </label>
              <input
                type="number"
                value={formData.target_leads}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target_leads: parseInt(e.target.value) || 0,
                  })
                }
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-muted-foreground">
                Target sample size before deciding to Scale, Hold, or Kill.
              </p>
            </div>
          </div>

          {/* Benchmark Targets Grid */}
          <div className="p-4 rounded-lg bg-surface-subtle border border-border space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <span>Performance Benchmarks &amp; Success Criteria</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">
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
                  className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">
                  Expected Delivery %
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
                  className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">
                  Target Profit / Delivered (DT)
                </label>
                <input
                  type="number"
                  step="1.0"
                  value={formData.target_profit_per_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_profit_per_order: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Planned Creatives & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Planned Creatives
              </label>
              <input
                type="number"
                value={formData.planned_creative_quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    planned_creative_quantity: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Hypothesis &amp; Test Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Testing video hook vs problem demonstration"
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>
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
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? "Launching..." : "Launch Test Campaign"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
