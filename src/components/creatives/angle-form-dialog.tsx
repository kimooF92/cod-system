"use client";

import * as React from "react";
import { X, Plus, Sparkles, Target, Layers } from "lucide-react";
import { createMarketingAngle } from "@/actions/creatives";
import { getProducts, type Product } from "@/actions/products";
import {
  creativeFormatEnum,
  CREATIVE_FORMAT_LABELS,
  type MarketingAngleInput,
  type CreativeFormat,
} from "@/lib/validations/creative";

interface AngleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AngleFormDialog({
  isOpen,
  onClose,
  onSuccess,
}: AngleFormDialogProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<MarketingAngleInput>({
    product_id: "",
    name: "",
    pain_point: "",
    promise: "",
    target_customer_avatar: "Daily Commuters / Taxi Drivers",
    creative_format: "PROBLEM_SOLUTION",
    notes: "",
  });

  React.useEffect(() => {
    if (isOpen) {
      getProducts().then((data) => {
        setProducts(data);
        if (data.length > 0 && !formData.product_id) {
          setFormData((prev) => ({ ...prev, product_id: data[0].id }));
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createMarketingAngle(formData);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Failed to create marketing angle");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Register Marketing Angle (FR-13)
              </h3>
              <p className="text-xs text-muted-foreground">
                Link core pain points, promises, and customer avatars to a product
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
              Target Product
            </label>
            <select
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              required
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="" disabled>
                -- Choose a product --
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku || "NO-SKU"})
                </option>
              ))}
            </select>
          </div>

          {/* Angle Name & Customer Avatar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Angle Name / Hook Concept
              </label>
              <input
                type="text"
                placeholder="e.g. Rough Road / Pothole Proof"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Target Customer Avatar
              </label>
              <input
                type="text"
                placeholder="e.g. Bolt Drivers, Office Workers"
                value={formData.target_customer_avatar}
                onChange={(e) =>
                  setFormData({ ...formData, target_customer_avatar: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Pain Point & Promise */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Core Pain Point Addressed
            </label>
            <input
              type="text"
              placeholder="e.g. Phone falls off cheap plastic mounts every time hitting a bump"
              value={formData.pain_point}
              onChange={(e) => setFormData({ ...formData, pain_point: e.target.value })}
              required
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Core Product Promise
            </label>
            <input
              type="text"
              placeholder="e.g. Ultra-strong magnetic grip guarantees 100% stability even on potholes"
              value={formData.promise}
              onChange={(e) => setFormData({ ...formData, promise: e.target.value })}
              required
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Creative Format */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Primary Creative Format (FR-15)
            </label>
            <select
              value={formData.creative_format}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  creative_format: e.target.value as CreativeFormat,
                })
              }
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {Object.keys(CREATIVE_FORMAT_LABELS).map((fmt) => (
                <option key={fmt} value={fmt}>
                  {CREATIVE_FORMAT_LABELS[fmt as CreativeFormat].label} — {CREATIVE_FORMAT_LABELS[fmt as CreativeFormat].description}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Production Notes / Script Angles
            </label>
            <input
              type="text"
              placeholder="e.g. Film in taxi during daylight with sudden braking test"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
            />
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
              <span>{loading ? "Saving..." : "Save Marketing Angle"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
