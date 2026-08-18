"use client";

import * as React from "react";
import {
  Video,
  Image as ImageIcon,
  Layers,
  Sparkles,
  ExternalLink,
  Trash2,
  Anchor,
  UserCheck,
} from "lucide-react";
import { updateCreativeAssetStatus, deleteCreativeAsset, type CreativeAsset } from "@/actions/creative-assets";
import type {
  CreativeLifecycleStatus,
  PerformanceTag,
  AssetType,
  AspectRatio,
} from "@/lib/validations/creative-asset";

interface CreativeAssetCardProps {
  asset: CreativeAsset;
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  TESTING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  FATIGUED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PAUSED: "bg-surface-subtle text-muted-foreground border-border",
  ARCHIVED: "bg-surface-subtle text-muted-foreground border-border",
};

const tagColors: Record<string, string> = {
  WINNER: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold",
  KEEP: "bg-blue-500/15 text-blue-400 border-blue-500/30 font-medium",
  ITERATE: "bg-amber-500/15 text-amber-400 border-amber-500/30 font-medium",
  KILL: "bg-red-500/15 text-red-400 border-red-500/30 font-bold",
};

export function CreativeAssetCard({ asset, onRefresh }: CreativeAssetCardProps) {
  const [updating, setUpdating] = React.useState(false);

  const handleStatusChange = async (newStatus: CreativeLifecycleStatus) => {
    setUpdating(true);
    await updateCreativeAssetStatus(asset.id, { lifecycle_status: newStatus });
    setUpdating(false);
    onRefresh();
  };

  const handleTagChange = async (newTag: PerformanceTag) => {
    setUpdating(true);
    await updateCreativeAssetStatus(asset.id, { performance_tag: newTag });
    setUpdating(false);
    onRefresh();
  };

  const handleDelete = async () => {
    if (confirm(`Delete creative asset ${asset.code}?`)) {
      await deleteCreativeAsset(asset.id);
      onRefresh();
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between hover:border-muted-foreground/30 transition-all space-y-3">
      <div>
        {/* Card Header: Media preview / Aspect Tag / Code */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-surface-subtle border border-border flex items-center justify-center text-blue-400 flex-shrink-0">
              {asset.asset_type === "VIDEO" ? (
                <Video className="w-5 h-5" />
              ) : asset.asset_type === "IMAGE" ? (
                <ImageIcon className="w-5 h-5" />
              ) : (
                <Layers className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-foreground">
                  {asset.code}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-subtle text-muted-foreground border border-border">
                  {asset.aspect_ratio}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                {asset.product?.name || "Product"}
              </p>
            </div>
          </div>

          {/* Quick Tag Selector */}
          <select
            value={asset.performance_tag}
            disabled={updating}
            onChange={(e) => handleTagChange(e.target.value as PerformanceTag)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono border focus:outline-none cursor-pointer ${
              tagColors[asset.performance_tag] || tagColors.KEEP
            }`}
          >
            <option value="KEEP">KEEP</option>
            <option value="WINNER">WINNER</option>
            <option value="ITERATE">ITERATE</option>
            <option value="KILL">KILL</option>
          </select>
        </div>

        {/* Hook / Script Snippet */}
        {asset.primary_hook_text && (
          <div className="p-2.5 rounded-md bg-surface-subtle border border-border/60 text-xs text-foreground font-medium my-2">
            <div className="flex items-center gap-1 text-[10px] text-purple-400 font-mono mb-1">
              <Anchor className="w-3 h-3" />
              <span>Primary Hook:</span>
            </div>
            &ldquo;{asset.primary_hook_text}&rdquo;
          </div>
        )}

        {/* Angle & Creator Info */}
        <div className="text-[11px] text-muted-foreground space-y-1 pt-1">
          {asset.angle && (
            <p className="truncate">
              <strong className="text-foreground">Angle: </strong>
              {asset.angle.name}
            </p>
          )}
          <p className="truncate">
            <strong className="text-foreground">Creator: </strong>
            {asset.creator_source}
          </p>
        </div>
      </div>

      {/* Footer: Lifecycle Status & Delete */}
      <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2">
        <select
          value={asset.lifecycle_status}
          disabled={updating}
          onChange={(e) => handleStatusChange(e.target.value as CreativeLifecycleStatus)}
          className={`px-2 py-1 rounded text-[10px] font-mono border focus:outline-none cursor-pointer ${
            statusColors[asset.lifecycle_status] || statusColors.TESTING
          }`}
        >
          <option value="TESTING">TESTING</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="FATIGUED">FATIGUED</option>
          <option value="PAUSED">PAUSED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>

        <div className="flex items-center gap-1">
          {asset.media_url && (
            <a
              href={asset.media_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-muted-foreground hover:text-blue-400 hover:bg-surface-subtle rounded transition-colors"
              title="Open Media URL"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={handleDelete}
            className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-surface-subtle rounded transition-colors"
            title="Delete Asset"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
