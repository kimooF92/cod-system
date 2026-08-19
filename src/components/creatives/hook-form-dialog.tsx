"use client";

import * as React from "react";
import { X, Plus, Anchor, Lightbulb } from "lucide-react";
import { createMarketingHook } from "@/actions/creatives";
import {
  hookTypeEnum,
  HOOK_TYPE_LABELS,
  type MarketingHookInput,
  type HookType,
} from "@/lib/validations/creative";
import type { MarketingAngle } from "@/actions/creatives";

interface HookFormDialogProps {
  angle: MarketingAngle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function HookFormDialog({
  angle,
  isOpen,
  onClose,
  onSuccess,
}: HookFormDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<MarketingHookInput>({
    angle_id: "",
    hook_text: "",
    hook_type: "PROBLEM_AGITATION",
    notes: "",
  });

  React.useEffect(() => {
    if (angle) {
      setFormData({
        angle_id: angle.id,
        hook_text: "",
        hook_type: "PROBLEM_AGITATION",
        notes: "",
      });
      setError(null);
    }
  }, [angle]);

  if (!isOpen || !angle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createMarketingHook(formData);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Failed to add opening hook");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Anchor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Add Opening Hook
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-xs">
                {angle.name}
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

          {/* Hook Type Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Hook Type / Psychology
            </label>
            <select
              value={formData.hook_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hook_type: e.target.value as HookType,
                })
              }
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {Object.keys(HOOK_TYPE_LABELS).map((type) => (
                <option key={type} value={type}>
                  {HOOK_TYPE_LABELS[type as HookType].label} — {HOOK_TYPE_LABELS[type as HookType].description}
                </option>
              ))}
            </select>
          </div>

          {/* Hook Copy Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Opening Hook Script (First 3 Seconds)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Stop putting your phone on your dashboard if you love your screen!"
              value={formData.hook_text}
              onChange={(e) => setFormData({ ...formData, hook_text: e.target.value })}
              required
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Visual Direction / B-Roll Cue
            </label>
            <input
              type="text"
              placeholder="e.g. Quick cut: car hits pothole, sound effect, phone flies"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-purple-500"
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
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? "Adding..." : "Add Hook"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
