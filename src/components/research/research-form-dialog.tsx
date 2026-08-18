"use client";

import * as React from "react";
import { X, Plus, Calculator, Sparkles } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { calculateGrossMargin } from "@/lib/engine/calculations";
import { createResearchItem } from "@/actions/research";
import type { ResearchItemInput, ResearchStatus } from "@/lib/validations/research";

interface ResearchFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResearchFormDialog({
  isOpen,
  onClose,
  onSuccess,
}: ResearchFormDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<ResearchItemInput>({
    market: "Tunisia",
    problem: "",
    target_customer: "",
    pain_point: "",
    promise: "",
    competitors: "",
    estimated_cost: 20.0,
    estimated_price: 65.0,
    creative_opportunities: "",
    source: "",
    notes: "",
    status: "IDEA",
  });

  if (!isOpen) return null;

  const grossMargin =
    formData.estimated_price > 0
      ? (formData.estimated_price - formData.estimated_cost) / formData.estimated_price
      : null;

  const estimatedProfit = formData.estimated_price - formData.estimated_cost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createResearchItem(formData);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Failed to save research item");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Log New Product Research Item
              </h3>
              <p className="text-xs text-muted-foreground">
                Capture customer pain point, promise, and unit margin estimation
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Market & Target Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Target Market
              </label>
              <input
                type="text"
                value={formData.market}
                onChange={(e) =>
                  setFormData({ ...formData, market: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Target Customer &amp; Demographics
              </label>
              <input
                type="text"
                placeholder="e.g. Desk workers & commuters (25-45)"
                value={formData.target_customer}
                onChange={(e) =>
                  setFormData({ ...formData, target_customer: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Problem & Pain Point */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Core Problem
              </label>
              <input
                type="text"
                placeholder="What is broken or annoying?"
                value={formData.problem}
                onChange={(e) =>
                  setFormData({ ...formData, problem: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Specific Pain Point (Emotional Trigger)
              </label>
              <input
                type="text"
                placeholder="e.g. Lower back stiffness by 3 PM"
                value={formData.pain_point}
                onChange={(e) =>
                  setFormData({ ...formData, pain_point: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Product Promise */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Product Promise / Solution Statement
            </label>
            <input
              type="text"
              placeholder="e.g. Ergonomic honeycomb memory grid for all-day comfort"
              value={formData.promise}
              onChange={(e) =>
                setFormData({ ...formData, promise: e.target.value })
              }
              required
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Price & Cost Live Margin Calculator */}
          <div className="p-4 rounded-lg bg-surface-subtle border border-border space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Calculator className="w-3.5 h-3.5 text-blue-400" />
              <span>Unit Economics &amp; Gross Margin Estimator</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">
                  Estimated Price (DT)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.estimated_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimated_price: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">
                  Estimated Cost (DT)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.estimated_cost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimated_cost: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-md text-xs font-mono tabular-nums text-foreground focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground block">
                  Gross Profit / Unit
                </span>
                <div className="px-2.5 py-1.5 bg-surface border border-border rounded-md text-xs font-mono font-bold text-foreground tabular-nums">
                  {formatCurrency(estimatedProfit)}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground block">
                  Gross Margin %
                </span>
                <div
                  className={`px-2.5 py-1.5 bg-surface border rounded-md text-xs font-mono font-bold tabular-nums ${
                    grossMargin && grossMargin >= 0.6
                      ? "text-emerald-400 border-emerald-500/30"
                      : grossMargin && grossMargin >= 0.4
                      ? "text-amber-400 border-amber-500/30"
                      : "text-red-400 border-red-500/30"
                  }`}
                >
                  {formatPercent(grossMargin)}
                </div>
              </div>
            </div>
          </div>

          {/* Creative Opportunities & Competitors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Creative Angles &amp; Hooks
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Egg shock test video, 3 PM fatigue demonstration"
                value={formData.creative_opportunities || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    creative_opportunities: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Competitors &amp; Notes
              </label>
              <textarea
                rows={2}
                placeholder="Marketplace competitor pricing, supplier lead times"
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status & Action Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Initial Status:</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ResearchStatus,
                  })
                }
                className="px-2.5 py-1 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none"
              >
                <option value="IDEA">IDEA</option>
                <option value="VALIDATING">VALIDATING</option>
                <option value="READY_FOR_TEST">READY_FOR_TEST</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{loading ? "Saving..." : "Save Research Item"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
