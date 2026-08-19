"use client";

import * as React from "react";
import {
  X,
  Plus,
  Video,
  Image as ImageIcon,
  Sparkles,
  Anchor,
  Maximize2,
  Zap,
  ChevronDown,
} from "lucide-react";
import { createCreativeAsset, getNextCreativeCode } from "@/actions/creative-assets";
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

const DEFAULT_FORM: CreativeAssetInput = {
  code: "",
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
};

export function CreativeAssetDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreativeAssetDialogProps) {
  const [mode, setMode] = React.useState<"quick" | "full">("quick");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [angles, setAngles] = React.useState<MarketingAngle[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [autoCode, setAutoCode] = React.useState("");

  const [formData, setFormData] = React.useState<CreativeAssetInput>(DEFAULT_FORM);

  React.useEffect(() => {
    if (isOpen) {
      setMode("quick");
      setError(null);

      Promise.all([
        getProducts(),
        getMarketingAngles(),
        getNextCreativeCode(),
      ]).then(([prods, angs, nextCode]) => {
        setProducts(prods);
        setAngles(angs);
        setAutoCode(nextCode);

        setFormData({
          ...DEFAULT_FORM,
          code: nextCode,
          product_id: prods.length > 0 ? prods[0].id : "",
        });
      });
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

    // In quick mode, fill defaults for missing fields
    const payload: CreativeAssetInput = {
      ...formData,
      code: formData.code || autoCode,
    };

    const res = await createCreativeAsset(payload);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Failed to register creative asset");
    }
  };

  const isQuickValid =
    formData.product_id && (formData.primary_hook_text ?? "").trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Log Creative Asset
              </h3>
              <p className="text-xs text-muted-foreground">
                Auto-code:{" "}
                <span className="font-mono text-purple-400">{autoCode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <div className="flex rounded-md border border-border overflow-hidden text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setMode("quick")}
                className={`px-2.5 py-1 transition-colors flex items-center gap-1 ${
                  mode === "quick"
                    ? "bg-purple-600/20 text-purple-400"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap className="w-2.5 h-2.5" />
                Quick
              </button>
              <button
                type="button"
                onClick={() => setMode("full")}
                className={`px-2.5 py-1 transition-colors ${
                  mode === "full"
                    ? "bg-purple-600/20 text-purple-400"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Full
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* ── QUICK MODE ── */}
          {mode === "quick" && (
            <>
              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15 text-xs text-purple-400 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  Quick mode — 3 fields only. Type, ratio & tags use smart defaults.
                </span>
              </div>

              {/* Product */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Product</label>
                <select
                  value={formData.product_id}
                  onChange={(e) =>
                    setFormData({ ...formData, product_id: e.target.value, angle_id: "", hook_id: "" })
                  }
                  required
                  className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hook Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Hook / Opening Line <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder='e.g. "Tired of your phone flying off every pothole?"'
                  value={formData.primary_hook_text || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, primary_hook_text: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Media URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Media URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or TikTok link"
                  value={formData.media_url || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, media_url: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Quick asset type selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["VIDEO", "IMAGE"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, asset_type: t })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs transition-all ${
                        formData.asset_type === t
                          ? "bg-purple-500/15 border-purple-500/40 text-purple-400"
                          : "bg-surface-subtle border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t === "VIDEO" ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMode("full")}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                Advanced options (angle, ratio, lifecycle…)
              </button>
            </>
          )}

          {/* ── FULL MODE ── */}
          {mode === "full" && (
            <>
              {/* Code field */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Anchor className="w-3 h-3" /> Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Product</label>
                  <select
                    value={formData.product_id}
                    onChange={(e) =>
                      setFormData({ ...formData, product_id: e.target.value, angle_id: "", hook_id: "" })
                    }
                    required
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Angle + Hook */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Marketing Angle
                  </label>
                  <select
                    value={formData.angle_id || ""}
                    onChange={(e) => handleAngleSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="">— No angle linked —</option>
                    {filteredAngles.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Hook (from angle)</label>
                  <select
                    value={formData.hook_id || ""}
                    onChange={(e) => setFormData({ ...formData, hook_id: e.target.value })}
                    disabled={!selectedAngle?.hooks?.length}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-purple-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="">— No hook linked —</option>
                    {selectedAngle?.hooks?.map((h: any) => (
                      <option key={h.id} value={h.id}>{h.hook_text}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Primary Hook Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Primary Hook Text</label>
                <textarea
                  rows={2}
                  placeholder="Opening hook as it appears in the creative..."
                  value={formData.primary_hook_text || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, primary_hook_text: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Type, Ratio, Creator */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <select
                    value={formData.asset_type}
                    onChange={(e) => setFormData({ ...formData, asset_type: e.target.value as AssetType })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {assetTypeEnum.options.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" /> Ratio
                  </label>
                  <select
                    value={formData.aspect_ratio}
                    onChange={(e) => setFormData({ ...formData, aspect_ratio: e.target.value as AspectRatio })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {aspectRatioEnum.options.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Source</label>
                  <input
                    type="text"
                    value={formData.creator_source}
                    onChange={(e) => setFormData({ ...formData, creator_source: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Media URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.media_url || ""}
                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Thumbnail URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.thumbnail_url || ""}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Status + Tag + Notes */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Lifecycle</label>
                  <select
                    value={formData.lifecycle_status}
                    onChange={(e) => setFormData({ ...formData, lifecycle_status: e.target.value as CreativeLifecycleStatus })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none cursor-pointer"
                  >
                    {creativeLifecycleEnum.options.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tag</label>
                  <select
                    value={formData.performance_tag}
                    onChange={(e) => setFormData({ ...formData, performance_tag: e.target.value as PerformanceTag })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none cursor-pointer"
                  >
                    {performanceTagEnum.options.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Notes</label>
                  <input
                    type="text"
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </>
          )}

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
              disabled={loading || (mode === "quick" && !isQuickValid)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? "Saving..." : `Log ${autoCode}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
