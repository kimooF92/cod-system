"use client";

import * as React from "react";
import { Sparkles, TrendingUp, AlertTriangle, ArrowRight, Zap } from "lucide-react";
import {
  evaluateCreativePerformance,
  type CreativeRecommendationResult,
} from "@/lib/engine/creative-recommendations";
import { CreativeRecommendationBadge } from "../creatives/creative-recommendation-badge";
import type { AdPerformanceRecord } from "@/actions/ad-performance";

interface CreativeRecommendationsBannerProps {
  records: AdPerformanceRecord[];
}

export function CreativeRecommendationsBanner({
  records,
}: CreativeRecommendationsBannerProps) {
  // Aggregate recommendations per product/creative
  const recommendations: { name: string; rec: CreativeRecommendationResult }[] = [];

  const seen = new Set<string>();
  for (const r of records) {
    const key = r.creative_id || r.product_id;
    if (!key || seen.has(key)) continue;
    seen.add(key);

    const targetCpl = r.product?.target_cpl || 5.0;
    const breakEvenCpl = targetCpl * 2.2;

    const rec = evaluateCreativePerformance({
      spend: r.spend,
      impressions: r.impressions,
      clicks: r.clicks,
      leads: r.leads,
      targetCpl,
      breakEvenCpl,
    });

    if (rec.action !== "COLLECT_DATA") {
      recommendations.push({
        name: r.creative ? `${r.creative.code} (${r.product?.name})` : r.product?.name || "Ad Asset",
        rec,
      });
    }
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-foreground">
            Automated Creative Recommendations (FR-22)
          </h3>
        </div>

        <span className="text-[10px] font-mono text-muted-foreground">
          {recommendations.length} action items detected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {recommendations.map((item, idx) => (
          <div
            key={idx}
            className="p-3 bg-surface-subtle border border-border/80 rounded-lg flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  {item.name}
                </span>
                <CreativeRecommendationBadge rec={item.rec} />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {item.rec.rationale}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
