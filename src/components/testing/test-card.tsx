"use client";

import * as React from "react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { updateTestStatus, deleteProductTest, type ProductTest } from "@/actions/tests";
import type { TestStatus } from "@/lib/validations/test";
import { FlaskConical, Target, TrendingUp, CheckCircle, XCircle, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";

interface TestCardProps {
  test: ProductTest;
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  RUNNING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function TestCard({ test, onRefresh }: TestCardProps) {
  const [updating, setUpdating] = React.useState(false);
  const p = test.performance;
  const product = test.product;

  const handleStatusChange = async (newStatus: TestStatus) => {
    setUpdating(true);
    await updateTestStatus(test.id, newStatus);
    setUpdating(false);
    onRefresh();
  };

  const handleDelete = async () => {
    if (confirm("Delete this test campaign?")) {
      await deleteProductTest(test.id);
      onRefresh();
    }
  };

  const budgetProgress = p?.budgetUtilization ? Math.min(p.budgetUtilization * 100, 100) : 0;
  const leadProgress = p?.leadProgressRate ? Math.min(p.leadProgressRate * 100, 100) : 0;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between hover:border-muted-foreground/30 transition-all space-y-4">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-muted-foreground bg-surface-subtle px-2 py-0.5 rounded border border-border">
                {product?.sku || "NO-SKU"} &bull; {test.planned_creative_quantity} Creatives Planned
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                Started {format(new Date(test.start_date), "MMM d")}
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground mt-2 leading-tight">
              {product?.name || "Product Test"}
            </h4>
          </div>

          <select
            value={test.status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value as TestStatus)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono border focus:outline-none cursor-pointer ${
              statusColors[test.status] || statusColors.RUNNING
            }`}
          >
            <option value="RUNNING">RUNNING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Budget Progress Bar */}
        <div className="space-y-1.5 my-3 p-3 rounded-lg bg-surface-subtle border border-border/60">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">Budget Cap:</span>
            <span className="font-bold text-foreground tabular-nums">
              {formatCurrency(p?.adSpend)} / {formatCurrency(test.budget)} ({budgetProgress.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border">
            <div
              className={`h-2 rounded-full transition-all ${
                budgetProgress > 90
                  ? "bg-red-500"
                  : budgetProgress > 70
                  ? "bg-amber-500"
                  : "bg-blue-600"
              }`}
              style={{ width: `${budgetProgress}%` }}
            />
          </div>

          {/* Leads Sample Bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
            <span>Leads Progress:</span>
            <span className="text-foreground font-medium tabular-nums">
              {p?.leads || 0} / {test.target_leads} leads ({leadProgress.toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* Benchmark Evaluation KPI Grid (FR-10) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* CPL */}
          <div className="p-2.5 bg-surface-subtle/50 rounded-lg border border-border">
            <span className="text-[10px] uppercase text-muted-foreground block font-mono">
              Actual CPL
            </span>
            <span className="text-xs font-mono font-bold text-foreground tabular-nums">
              {formatCurrency(p?.actualCPL)}
            </span>
            <div className="mt-1">
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                  p?.isCplBeatingTarget
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-red-400 bg-red-500/10 border-red-500/20"
                }`}
              >
                Target: {formatCurrency(test.target_cpl)}
              </span>
            </div>
          </div>

          {/* Delivery Rate */}
          <div className="p-2.5 bg-surface-subtle/50 rounded-lg border border-border">
            <span className="text-[10px] uppercase text-muted-foreground block font-mono">
              Delivery Rate
            </span>
            <span className="text-xs font-mono font-bold text-foreground tabular-nums">
              {formatPercent(p?.deliveryRate)}
            </span>
            <div className="mt-1">
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                  p?.isDeliveryBeatingTarget
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                }`}
              >
                Target: {formatPercent(test.expected_delivery_rate)}
              </span>
            </div>
          </div>

          {/* Net Profit */}
          <div className="p-2.5 bg-surface-subtle/50 rounded-lg border border-border">
            <span className="text-[10px] uppercase text-muted-foreground block font-mono">
              Delivered Net
            </span>
            <span
              className={`text-xs font-mono font-bold tabular-nums ${
                (p?.netProfit || 0) > 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatCurrency(p?.netProfit)}
            </span>
            <div className="mt-1">
              <span className="text-[9px] font-mono text-muted-foreground block truncate">
                {p?.deliveredOrders || 0} delivered orders
              </span>
            </div>
          </div>

          {/* Profit per Lead */}
          <div className="p-2.5 bg-surface-subtle/50 rounded-lg border border-border">
            <span className="text-[10px] uppercase text-muted-foreground block font-mono">
              Profit / Lead
            </span>
            <span
              className={`text-xs font-mono font-bold tabular-nums ${
                (p?.profitPerLead || 0) > 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatCurrency(p?.profitPerLead)}
            </span>
            <div className="mt-1">
              <span className="text-[9px] font-mono text-muted-foreground block truncate">
                per raw lead
              </span>
            </div>
          </div>
        </div>

        {/* Test Notes if present */}
        {test.notes && (
          <p className="text-xs text-muted-foreground italic mt-3 bg-surface-subtle/30 p-2 rounded border border-border/40">
            &ldquo;{test.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="pt-3 border-t border-border flex items-center justify-between">
        <div className="text-[11px] font-mono text-muted-foreground">
          Profit/Delivered:{" "}
          <strong className="text-foreground font-semibold">
            {formatCurrency(p?.profitPerDeliveredOrder)}
          </strong>
        </div>

        <button
          onClick={handleDelete}
          className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-surface-subtle rounded transition-colors"
          title="Delete Test Campaign"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
