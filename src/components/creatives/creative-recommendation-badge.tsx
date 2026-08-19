"use client";

import * as React from "react";
import {
  TrendingUp,
  Sparkles,
  PauseCircle,
  XCircle,
  Clock,
  Info,
} from "lucide-react";
import type {
  CreativeRecommendationResult,
  RecommendationAction,
} from "@/lib/engine/creative-recommendations";

interface CreativeRecommendationBadgeProps {
  rec: CreativeRecommendationResult;
}

const actionStyles: Record<
  RecommendationAction,
  { bg: string; text: string; border: string; icon: any; label: string }
> = {
  SCALE: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: TrendingUp,
    label: "SCALE AD",
  },
  ITERATE_HOOK: {
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    border: "border-purple-500/30",
    icon: Sparkles,
    label: "ITERATE HOOK",
  },
  PAUSE: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    icon: PauseCircle,
    label: "PAUSE AD",
  },
  KILL: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    border: "border-red-500/30",
    icon: XCircle,
    label: "KILL CREATIVE",
  },
  COLLECT_DATA: {
    bg: "bg-surface-subtle",
    text: "text-muted-foreground",
    border: "border-border",
    icon: Clock,
    label: "COLLECT DATA",
  },
};

export function CreativeRecommendationBadge({ rec }: CreativeRecommendationBadgeProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const style = actionStyles[rec.action] || actionStyles.COLLECT_DATA;
  const Icon = style.icon;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all ${style.bg} ${style.text} ${style.border}`}
      >
        <Icon className="w-3 h-3" />
        <span>{style.label}</span>
      </button>

      {/* Rationale Popover */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-surface border border-border rounded-lg shadow-xl text-left pointer-events-none">
          <div className="flex items-center gap-1 text-[11px] font-bold text-foreground mb-1">
            <span className={style.text}>{rec.headline}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
            {rec.rationale}
          </p>
          <div className="pt-2 border-t border-border/80 text-[10px] font-mono text-blue-400 font-semibold">
            &rarr; {rec.suggestedAction}
          </div>
        </div>
      )}
    </div>
  );
}
