"use client";

import * as React from "react";
import { X, Plus, Users } from "lucide-react";
import { createAdSet, type CampaignHierarchy } from "@/actions/campaigns";
import type { AdSetInput } from "@/lib/validations/campaign";

interface AdSetFormDialogProps {
  campaign: CampaignHierarchy | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdSetFormDialog({
  campaign,
  isOpen,
  onClose,
  onSuccess,
}: AdSetFormDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<AdSetInput>({
    campaign_id: "",
    name: "",
    audience_targeting: "Broad Tunisia 22-55",
    daily_budget: null,
    status: "ACTIVE",
  });

  React.useEffect(() => {
    if (campaign) {
      setFormData({
        campaign_id: campaign.id,
        name: "",
        audience_targeting: "Broad Tunisia 22-55",
        daily_budget: null,
        status: "ACTIVE",
      });
      setError(null);
    }
  }, [campaign]);

  if (!isOpen || !campaign) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createAdSet(formData);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Failed to add ad set");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Add Ad Set / Target Audience
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-xs">
                {campaign.name}
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

          {/* Ad Set Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Ad Set Name
            </label>
            <input
              type="text"
              placeholder="e.g. Broad Tunisia 25-50 Auto Placements"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Audience Targeting */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Audience &amp; Placement Targeting
            </label>
            <input
              type="text"
              placeholder="e.g. All Tunisia, Age 22-55, Men, Advantage+ Placements"
              value={formData.audience_targeting}
              onChange={(e) =>
                setFormData({ ...formData, audience_targeting: e.target.value })
              }
              required
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Optional Ad Set Budget */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Ad Set Daily Budget (Optional ABO Budget)
            </label>
            <input
              type="number"
              step="5.0"
              placeholder="Leave blank for Campaign CBO budget"
              value={formData.daily_budget || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  daily_budget: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-purple-500"
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
              <span>{loading ? "Adding..." : "Add Ad Set"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
