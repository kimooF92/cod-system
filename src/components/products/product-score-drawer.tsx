"use client";

import * as React from "react";
import { X, Sparkles, Target, DollarSign, Truck, Users, Lightbulb, CheckCircle2 } from "lucide-react";
import { ProductScoreBadge } from "./product-score-badge";
import type { ProductScoreResult } from "@/lib/engine/product-scoring";
import type { Product } from "@/actions/products";

interface ProductScoreDrawerProps {
  product: Product | null;
  scoreResult: ProductScoreResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductScoreDrawer({
  product,
  scoreResult,
  isOpen,
  onClose,
}: ProductScoreDrawerProps) {
  if (!isOpen || !product || !scoreResult) return null;

  const dims = scoreResult.dimensions;

  const dimensionIcons: Record<string, React.ReactNode> = {
    cpl: <Target className="w-3.5 h-3.5 text-blue-400" />,
    profit: <DollarSign className="w-3.5 h-3.5 text-emerald-400" />,
    delivery: <Truck className="w-3.5 h-3.5 text-purple-400" />,
    confirmation: <Users className="w-3.5 h-3.5 text-amber-400" />,
    creative: <Lightbulb className="w-3.5 h-3.5 text-pink-400" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border-l border-border w-full max-w-lg h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                0–100 Product Score Breakdown (FR-12)
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                {product.name}
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

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* Top Score Box */}
          <div className="p-4 rounded-xl bg-surface-subtle border border-border flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                Composite Score &bull; Grade {scoreResult.grade}
              </span>
              <h4 className="text-base font-bold text-foreground">
                {scoreResult.gradeLabel}
              </h4>
            </div>

            <ProductScoreBadge
              score={scoreResult.compositeScore}
              grade={scoreResult.grade}
              size="lg"
            />
          </div>

          {/* Strategic Recommendation */}
          <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
            <span className="font-semibold text-blue-400 block font-mono uppercase text-[10px]">
              Engine Recommendation:
            </span>
            <p className="text-foreground">{scoreResult.recommendation}</p>
          </div>

          {/* Dimension Breakdown Bars */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase font-mono tracking-wider">
              Sub-Dimension Scores (Weighted 100%)
            </h4>

            {Object.entries(dims).map(([key, dim]) => {
              const barColor =
                dim.score >= 80
                  ? "bg-emerald-500"
                  : dim.score >= 60
                  ? "bg-blue-500"
                  : dim.score >= 40
                  ? "bg-amber-500"
                  : "bg-red-500";

              return (
                <div
                  key={key}
                  className="p-3.5 rounded-lg bg-surface-subtle/60 border border-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {dimensionIcons[key]}
                      <span className="text-xs font-semibold text-foreground">
                        {dim.name}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        ({(dim.weight * 100).toFixed(0)}% weight)
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1 font-mono text-xs font-bold text-foreground tabular-nums">
                      <span>{dim.score}</span>
                      <span className="text-[10px] text-muted-foreground">/ 100</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden border border-border">
                    <div
                      className={`h-1.5 rounded-full transition-all ${barColor}`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>

                  {/* Context Metrics & Explanation */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-0.5">
                    <span>Actual: <strong className="text-foreground">{dim.actual}</strong></span>
                    <span>Benchmark: <strong>{dim.benchmark}</strong></span>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic pt-0.5">
                    {dim.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-surface-subtle border border-border text-xs text-foreground hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
