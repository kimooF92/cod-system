"use client";

import * as React from "react";
import { AngleRegistry } from "./angle-registry";
import { CreativeAssetList } from "./creative-asset-list";
import type { MarketingAngle } from "@/actions/creatives";
import type { CreativeAsset } from "@/actions/creative-assets";
import { Sparkles, Video, Layers } from "lucide-react";

interface CreativeHubProps {
  initialAngles: MarketingAngle[];
  initialAssets: CreativeAsset[];
}

export function CreativeHub({ initialAngles, initialAssets }: CreativeHubProps) {
  const [activeTab, setActiveTab] = React.useState<"ANGLES" | "ASSETS">("ANGLES");

  return (
    <div className="space-y-6">
      {/* Top Level Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab("ANGLES")}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-xs font-semibold transition-all border-b-2 ${
            activeTab === "ANGLES"
              ? "text-blue-400 border-blue-500 bg-surface"
              : "text-muted-foreground border-transparent hover:text-foreground hover:bg-surface-subtle"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Angles &amp; Hooks Registry (FR-13, FR-14)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-surface-subtle border border-border">
            {initialAngles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ASSETS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-xs font-semibold transition-all border-b-2 ${
            activeTab === "ASSETS"
              ? "text-blue-400 border-blue-500 bg-surface"
              : "text-muted-foreground border-transparent hover:text-foreground hover:bg-surface-subtle"
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Creative Asset Library (FR-16, FR-17)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-surface-subtle border border-border">
            {initialAssets.length}
          </span>
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === "ANGLES" ? (
        <AngleRegistry initialAngles={initialAngles} />
      ) : (
        <CreativeAssetList initialAssets={initialAssets} />
      )}
    </div>
  );
}
