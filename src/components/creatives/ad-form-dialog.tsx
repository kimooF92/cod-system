"use client";

import * as React from "react";
import { X, Plus, Video, Image as ImageIcon } from "lucide-react";
import { createAd, type AdSetItem } from "@/actions/campaigns";
import { getProducts, type Product } from "@/actions/products";
import { getCreativeAssets, type CreativeAsset } from "@/actions/creative-assets";
import type { AdInput } from "@/lib/validations/campaign";

interface AdFormDialogProps {
  adSet: AdSetItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdFormDialog({
  adSet,
  isOpen,
  onClose,
  onSuccess,
}: AdFormDialogProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [assets, setAssets] = React.useState<CreativeAsset[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<AdInput>({
    ad_set_id: "",
    name: "",
    product_id: "",
    creative_id: "",
    status: "ACTIVE",
  });

  React.useEffect(() => {
    if (isOpen) {
      getProducts().then((prods) => {
        setProducts(prods);
        if (prods.length > 0 && !formData.product_id) {
          setFormData((prev) => ({ ...prev, product_id: prods[0].id }));
        }
      });
      getCreativeAssets().then((crAssets) => {
        setAssets(crAssets);
        if (crAssets.length > 0 && !formData.creative_id) {
          setFormData((prev) => ({ ...prev, creative_id: crAssets[0].id }));
        }
      });
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (adSet) {
      setFormData((prev) => ({
        ...prev,
        ad_set_id: adSet.id,
        name: "",
      }));
      setError(null);
    }
  }, [adSet]);

  if (!isOpen || !adSet) return null;

  const handleCreativeSelect = (creativeId: string) => {
    const asset = assets.find((a) => a.id === creativeId);
    setFormData((prev) => ({
      ...prev,
      creative_id: creativeId,
      name: asset ? `${asset.code} - ${asset.product?.name || "Ad"}` : prev.name,
      product_id: asset ? asset.product_id : prev.product_id,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createAd(formData);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Failed to map ad to creative asset");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Map Ad to Creative Asset
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-xs">
                {adSet.name}
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

          {/* Creative Asset Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Select Creative Asset (CR-XXX)
            </label>
            <select
              value={formData.creative_id}
              onChange={(e) => handleCreativeSelect(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="" disabled>
                -- Choose creative asset --
              </option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} ({a.aspect_ratio} {a.asset_type}) &bull; {a.product?.name || "Product"}
                </option>
              ))}
            </select>
          </div>

          {/* Ad Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Ad Name in Meta / TikTok
            </label>
            <input
              type="text"
              placeholder="e.g. CR-001 - Pothole Speed Test UGC"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Linked Product */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Linked Product
            </label>
            <select
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              required
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="" disabled>
                -- Choose product --
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku || "NO-SKU"})
                </option>
              ))}
            </select>
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
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? "Mapping..." : "Map Ad"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
