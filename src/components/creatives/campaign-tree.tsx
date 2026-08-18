"use client";

import * as React from "react";
import {
  Layers,
  Users,
  Video,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Target,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  deleteCampaign,
  deleteAdSet,
  deleteAd,
  type CampaignHierarchy,
  type AdSetItem,
  type AdItem,
} from "@/actions/campaigns";
import { CampaignFormDialog } from "./campaign-form-dialog";
import { AdSetFormDialog } from "./adset-form-dialog";
import { AdFormDialog } from "./ad-form-dialog";

interface CampaignTreeProps {
  initialCampaigns: CampaignHierarchy[];
  onRefresh: () => void;
}

const platformBadges: Record<string, string> = {
  META_ADS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  TIKTOK_ADS: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  SNAPCHAT_ADS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  GOOGLE_ADS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const objectiveBadges: Record<string, string> = {
  SCALING: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold",
  TESTING: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  RETARGETING: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  WARMUP: "bg-surface-subtle text-muted-foreground border-border",
};

export function CampaignTree({ initialCampaigns, onRefresh }: CampaignTreeProps) {
  const [expandedCampaigns, setExpandedCampaigns] = React.useState<Record<string, boolean>>({
    "camp-1": true,
    "camp-2": true,
  });
  const [expandedAdSets, setExpandedAdSets] = React.useState<Record<string, boolean>>({
    "adset-1": true,
    "adset-2": true,
    "adset-3": true,
  });

  // Modal states
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = React.useState(false);
  const [targetCampaignForAdSet, setTargetCampaignForAdSet] = React.useState<CampaignHierarchy | null>(null);
  const [targetAdSetForAd, setTargetAdSetForAd] = React.useState<AdSetItem | null>(null);

  const toggleCampaign = (id: string) => {
    setExpandedCampaigns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAdSet = (id: string) => {
    setExpandedAdSets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteCampaign = async (id: string) => {
    if (confirm("Delete this campaign and all its ad sets and ads?")) {
      await deleteCampaign(id);
      onRefresh();
    }
  };

  const handleDeleteAdSet = async (id: string) => {
    if (confirm("Delete this ad set and its ads?")) {
      await deleteAdSet(id);
      onRefresh();
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (confirm("Delete this ad mapping?")) {
      await deleteAd(id);
      onRefresh();
    }
  };

  const totalDailyBudget = initialCampaigns.reduce((sum, c) => sum + (c.daily_budget || 0), 0);
  const totalAds = initialCampaigns.reduce(
    (sum, c) => sum + c.ad_sets.reduce((s, as) => s + as.ads.length, 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Campaign &amp; Ad Structure Mapping
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            3-level hierarchy: Campaign &rarr; Ad Set &rarr; Ad (linked to Products &amp; Creative Assets)
          </p>
        </div>

        <button
          onClick={() => setIsCampaignDialogOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Active Campaigns</span>
          <span className="text-base font-mono font-bold text-blue-400 tabular-nums">
            {initialCampaigns.length}
          </span>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Total Daily Budget</span>
          <span className="text-base font-mono font-bold text-foreground tabular-nums">
            {formatCurrency(totalDailyBudget)}/day
          </span>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Mapped Ads</span>
          <span className="text-base font-mono font-bold text-emerald-400 tabular-nums">
            {totalAds}
          </span>
        </div>
      </div>

      {/* Campaign Tree Container */}
      <div className="space-y-4">
        {initialCampaigns.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              No campaigns mapped yet
            </h4>
            <p className="text-xs text-muted-foreground">
              Create your first campaign structure and map creative assets.
            </p>
          </div>
        ) : (
          initialCampaigns.map((camp) => {
            const isCampExpanded = !!expandedCampaigns[camp.id];

            return (
              <div
                key={camp.id}
                className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm transition-all"
              >
                {/* Level 1: Campaign Row */}
                <div className="p-4 bg-surface-subtle/40 border-b border-border/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => toggleCampaign(camp.id)}
                      className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                    >
                      {isCampExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className="w-7 h-7 rounded-md bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground">
                          {camp.name}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                            platformBadges[camp.platform] || "text-muted-foreground border-border"
                          }`}
                        >
                          {camp.platform}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                            objectiveBadges[camp.objective] || "text-muted-foreground border-border"
                          }`}
                        >
                          {camp.objective}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        Daily Budget: <strong className="text-foreground">{formatCurrency(camp.daily_budget)}</strong> &bull; {camp.ad_sets.length} Ad Sets
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setTargetCampaignForAdSet(camp)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 text-xs font-medium transition-colors"
                      title="Add Ad Set to Campaign"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Ad Set</span>
                    </button>

                    <button
                      onClick={() => handleDeleteCampaign(camp.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-surface-subtle rounded transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Level 2: Ad Sets List */}
                {isCampExpanded && (
                  <div className="p-4 space-y-3 bg-surface">
                    {camp.ad_sets.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground font-mono bg-surface-subtle/30 rounded border border-dashed border-border">
                        No ad sets created yet in this campaign.
                      </div>
                    ) : (
                      camp.ad_sets.map((adSet) => {
                        const isAdSetExpanded = !!expandedAdSets[adSet.id];

                        return (
                          <div
                            key={adSet.id}
                            className="ml-4 pl-3 border-l-2 border-purple-500/30 bg-surface-subtle/50 rounded-lg p-3 space-y-3"
                          >
                            {/* Ad Set Header */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleAdSet(adSet.id)}
                                  className="p-0.5 text-muted-foreground hover:text-foreground"
                                >
                                  {isAdSetExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                <Users className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />

                                <div>
                                  <span className="text-xs font-semibold text-foreground">
                                    {adSet.name}
                                  </span>
                                  <p className="text-[10px] text-muted-foreground">
                                    {adSet.audience_targeting} &bull; {adSet.ads.length} Ads
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setTargetAdSetForAd(adSet)}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium transition-colors"
                                  title="Map Ad to Ad Set"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Map Ad</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteAdSet(adSet.id)}
                                  className="p-1 text-muted-foreground hover:text-red-400 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Level 3: Mapped Ads */}
                            {isAdSetExpanded && (
                              <div className="space-y-1.5 pl-6 pt-1">
                                {adSet.ads.length === 0 ? (
                                  <div className="text-[11px] text-muted-foreground italic">
                                    No ads mapped to this ad set yet.
                                  </div>
                                ) : (
                                  adSet.ads.map((ad) => (
                                    <div
                                      key={ad.id}
                                      className="p-2 rounded bg-surface border border-border/80 flex items-center justify-between gap-2 hover:border-muted-foreground/30 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                                          <Video className="w-3 h-3" />
                                        </div>

                                        <div>
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-semibold text-foreground">
                                              {ad.name}
                                            </span>
                                            {ad.creative && (
                                              <span className="text-[9px] font-mono px-1 rounded bg-surface-subtle text-muted-foreground border border-border">
                                                {ad.creative.code} ({ad.creative.aspect_ratio})
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[10px] text-muted-foreground">
                                            Product: <strong className="text-foreground">{ad.product?.name || "Product"}</strong>
                                          </p>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => handleDeleteAd(ad.id)}
                                        className="p-1 text-muted-foreground hover:text-red-400 rounded"
                                        title="Delete Ad Mapping"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Campaign Dialog */}
      <CampaignFormDialog
        isOpen={isCampaignDialogOpen}
        onClose={() => setIsCampaignDialogOpen(false)}
        onSuccess={onRefresh}
      />

      {/* Ad Set Dialog */}
      <AdSetFormDialog
        campaign={targetCampaignForAdSet}
        isOpen={!!targetCampaignForAdSet}
        onClose={() => setTargetCampaignForAdSet(null)}
        onSuccess={onRefresh}
      />

      {/* Ad Dialog */}
      <AdFormDialog
        adSet={targetAdSetForAd}
        isOpen={!!targetAdSetForAd}
        onClose={() => setTargetAdSetForAd(null)}
        onSuccess={onRefresh}
      />
    </div>
  );
}
