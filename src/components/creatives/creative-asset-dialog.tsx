"use client";

import * as React from "react";
import { X, Plus, Video, Image as ImageIcon, Sparkles, Anchor, Maximize2 } from "lucide-react";
import { createCreativeAsset } from "@/actions/creative-assets";
import { getProducts, type Product } from "@/actions/products";
import { getMarketingAngles, type MarketingAngle } from "@/actions/creatives";
import {
  assetTypeEnum,
  aspectRatioEnum,
  creativeLifecycleEnum,
  performanceTagEnum,
  type CreativeAssetInput,
  type AssetType,
  type AspectRatio,
  type CreativeLifecycleStatus,
  type PerformanceTag,
} from "@/lib/validations/creative-asset";

interface CreativeAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreativeAssetDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreativeAssetDialogProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [angles, setAngles] = React.useState<MarketingAngle[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<CreativeAssetInput>({
    code: "CR-004",
    product_id: "",
    angle_id: "",
    hook_id: "",
    asset_type: "VIDEO",
    aspect_ratio: "9:16",
    creator_source: "In-House UGC",
    media_url: "",
    thumbnail_url: "",
    primary_hook_text: "",
    lifecycle_status: "TESTING",
    performance_tag: "KEEP",
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
      getMarketingAngles().then(setAngles);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredAngles = angles.filter((a) => a.product_id === formData.product_id);
  const selectedAngle = angles.find((a) => a.id === formData.angle_id);

  const handleAngleSelect = (angleId: string) => {
    const angle = angles.find((a) => a.id === angleId);
    const defaultHook = angle?.hooks && angle.hooks.length > 0 ? angle.hooks[0] : null;
    setFormData((prev) => ({
      ...prev,
      angle_id: angleId,
      hook_id: defaultHook ? defaultHook.id : "",
      primary_hook_text: defaultHook ? defaultHook.hook_text : prev.primary_hook_text,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createCreativeAsset(formData);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Failed to register creative asset");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Register Creative Asset
              </h3>
              <p className="text-xs text-muted-foreground">
                Track creative code, aspect ratio, creator source &amp; linked hook
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

          {/* Code & Product */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Creative Code
              </label>
              <input
                type="text"
                placeholder="e.g. CR-001"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono font-bold text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Product
              </label>
              <select
                value={formData.product_id}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    product_id: e.target.value,
                    angle_id: "",
                    hook_id: "",
                  });
                }}
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500 cursor-pointer"
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
          </div>

          {/* Linked Angle & Hook */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Marketing Angle (Optional)
              </label>
              <select
                value={formData.angle_id || ""}
                onChange={(e) => handleAngleSelect(e.target.value)}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- None / General --</option>
                {filteredAngles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Creator / Source
              </label>
              <input
                type="text"
                placeholder="e.g. In-House UGC, Freelance Editor"
                value={formData.creator_source}
                onChange={(e) =>
                  setFormData({ ...formData, creator_source: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Asset Type & Aspect Ratio */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Asset Type
              </label>
              <select
                value={formData.asset_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    asset_type: e.target.value as AssetType,
                  })
                }
                className="w-full px-2.5 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="VIDEO">VIDEO</option>
                <option value="IMAGE">IMAGE</option>
                <option value="CAROUSEL">CAROUSEL</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Aspect Ratio
              </label>
              <select
                value={formData.aspect_ratio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aspect_ratio: e.target.value as AspectRatio,
                  })
                }
                className="w-full px-2.5 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="9:16">9:16 (Story/Reels)</option>
                <option value="1:1">1:1 (Square Feed)</option>
                <option value="4:5">4:5 (Vertical Feed)</option>
                <option value="16:9">16:9 (Landscape)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Lifecycle Status
              </label>
              <select
                value={formData.lifecycle_status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lifecycle_status: e.target.value as CreativeLifecycleStatus,
                  })
                }
                className="w-full px-2.5 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="TESTING">TESTING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="FATIGUED">FATIGUED</option>
                <option value="PAUSED">PAUSED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Performance Tag
              </label>
              <select
                value={formData.performance_tag}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    performance_tag: e.target.value as PerformanceTag,
                  })
                }
                className="w-full px-2.5 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="KEEP">KEEP</option>
                <option value="WINNER">WINNER</option>
                <option value="ITERATE">ITERATE</option>
                <option value="KILL">KILL</option>
              </select>
            </div>
          </div>

          {/* Primary Hook Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Primary Hook Copy / Opening Words
            </label>
            <input
              type="text"
              placeholder="e.g. Stop dropping your phone on rough roads"
              value={formData.primary_hook_text || ""}
              onChange={(e) =>
                setFormData({ ...formData, primary_hook_text: e.target.value })
              }
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Media URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Media URL / Google Drive / Dropbox Link
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={formData.media_url || ""}
              onChange={(e) =>
                setFormData({ ...formData, media_url: e.target.value })
              }
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
              <span>{loading ? "Registering..." : "Register Asset"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
