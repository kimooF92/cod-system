"use client";

import * as React from "react";
import { X, Plus, Layers, DollarSign } from "lucide-react";
import { createCampaign } from "@/actions/campaigns";
import {
  adPlatformEnum,
  campaignObjectiveEnum,
  type AdCampaignInput,
  type AdPlatform,
  type CampaignObjective,
} from "@/lib/validations/campaign";

interface CampaignFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CampaignFormDialog({
  isOpen,
  onClose,
  onSuccess,
}: CampaignFormDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<AdCampaignInput>({
    name: "",
    platform: "META_ADS",
    objective: "TESTING",
    daily_budget: 50.0,
    status: "ACTIVE",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createCampaign(formData);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Failed to create campaign");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Create Ad Campaign (FR-18)
              </h3>
              <p className="text-xs text-muted-foreground">
                Set campaign structure, platform &amp; daily budget cap
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

          {/* Campaign Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Campaign Name
            </label>
            <input
              type="text"
              placeholder="e.g. CBO - Winners Scale Q3"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Platform & Objective */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Ad Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    platform: e.target.value as AdPlatform,
                  })
                }
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="META_ADS">Meta Ads (FB/IG)</option>
                <option value="TIKTOK_ADS">TikTok Ads</option>
                <option value="SNAPCHAT_ADS">Snapchat Ads</option>
                <option value="GOOGLE_ADS">Google Ads</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Campaign Objective
              </label>
              <select
                value={formData.objective}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    objective: e.target.value as CampaignObjective,
                  })
                }
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="TESTING">TESTING</option>
                <option value="SCALING">SCALING</option>
                <option value="RETARGETING">RETARGETING</option>
                <option value="WARMUP">WARMUP</option>
              </select>
            </div>
          </div>

          {/* Daily Budget */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Daily Budget (Tunisian Dinars)
            </label>
            <input
              type="number"
              step="5.0"
              value={formData.daily_budget}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  daily_budget: parseFloat(e.target.value) || 0,
                })
              }
              required
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
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
              <span>{loading ? "Creating..." : "Create Campaign"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
