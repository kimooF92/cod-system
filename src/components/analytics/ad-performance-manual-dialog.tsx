"use client";

import * as React from "react";
import { X, Plus, DollarSign, Target, MousePointer, Eye, Calendar } from "lucide-react";
import { createAdPerformanceRecord } from "@/actions/ad-performance";
import { getProducts, type Product } from "@/actions/products";
import { getCreativeAssets, type CreativeAsset } from "@/actions/creative-assets";
import type { AdPerformanceDailyInput } from "@/lib/validations/ad-performance";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface AdPerformanceManualDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdPerformanceManualDialog({
  isOpen,
  onClose,
  onSuccess,
}: AdPerformanceManualDialogProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [creatives, setCreatives] = React.useState<CreativeAsset[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<AdPerformanceDailyInput>({
    product_id: "",
    creative_id: "",
    date: new Date().toISOString().split("T")[0],
    spend: 40.0,
    impressions: 2500,
    clicks: 80,
    leads: 10,
    notes: "",
  });

  React.useEffect(() => {
    if (isOpen) {
      getProducts().then((prods) => {
        setProducts(prods);
        if (prods.length > 0 && !formData.product_id) {
          setFormData((prev) => ({ ...prev, product_id: prods[0].id }));
        }
      });
      getCreativeAssets().then(setCreatives);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const estimatedCPL =
    formData.leads > 0 ? formData.spend / formData.leads : null;
  const estimatedCTR =
    formData.impressions > 0 ? formData.clicks / formData.impressions : null;
  const estimatedCPC =
    formData.clicks > 0 ? formData.spend / formData.clicks : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createAdPerformanceRecord(formData);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Failed to log daily ad performance");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Log Daily Ad Performance (FR-19)
              </h3>
              <p className="text-xs text-muted-foreground">
                Record ad spend, impressions, clicks &amp; leads
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

          {/* Product & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Product
              </label>
              <select
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="" disabled>
                  -- Select product --
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku || "NO-SKU"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Reporting Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Creative Asset (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Creative Asset (Optional)
            </label>
            <select
              value={formData.creative_id || ""}
              onChange={(e) => setFormData({ ...formData, creative_id: e.target.value || null })}
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">-- Blended Campaign Spend --</option>
              {creatives
                .filter((c) => !formData.product_id || c.product_id === formData.product_id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} ({c.aspect_ratio} {c.asset_type}) &bull; {c.primary_hook_text ? `"${c.primary_hook_text.slice(0, 35)}..."` : c.code}
                  </option>
                ))}
            </select>
          </div>

          {/* Spend & Leads */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Spend (DT)</label>
              <input
                type="number"
                step="1.0"
                value={formData.spend}
                onChange={(e) => setFormData({ ...formData, spend: parseFloat(e.target.value) || 0 })}
                required
                className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Impressions</label>
              <input
                type="number"
                value={formData.impressions}
                onChange={(e) => setFormData({ ...formData, impressions: parseInt(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Link Clicks</label>
              <input
                type="number"
                value={formData.clicks}
                onChange={(e) => setFormData({ ...formData, clicks: parseInt(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Leads / Results</label>
              <input
                type="number"
                value={formData.leads}
                onChange={(e) => setFormData({ ...formData, leads: parseInt(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Live Calculated Metric Pill */}
          <div className="p-3 bg-surface-subtle border border-border rounded-lg flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-muted-foreground">CTR: </span>
              <strong className="text-foreground">{formatPercent(estimatedCTR)}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">CPC: </span>
              <strong className="text-foreground">{formatCurrency(estimatedCPC)}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">CPL: </span>
              <strong className="text-blue-400 font-bold">{formatCurrency(estimatedCPL)}</strong>
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
              <span>{loading ? "Recording..." : "Save Daily Record"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
