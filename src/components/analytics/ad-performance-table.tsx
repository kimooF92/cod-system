"use client";

import * as React from "react";
import {
  DollarSign,
  Upload,
  Plus,
  Trash2,
  Calendar,
  Filter,
  BarChart3,
  MousePointer,
  TrendingUp,
} from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  getAdPerformanceRecords,
  deleteAdPerformanceRecord,
  type AdPerformanceRecord,
} from "@/actions/ad-performance";
import { getProducts, type Product } from "@/actions/products";
import { AdPerformanceManualDialog } from "./ad-performance-manual-dialog";
import { MetaCsvImportDialog } from "./meta-csv-import-dialog";
import { CreativeRecommendationsBanner } from "./creative-recommendations-banner";
import { aggregateAdPerformance } from "@/lib/engine/ad-metrics";

interface AdPerformanceTableProps {
  initialRecords: AdPerformanceRecord[];
}

export function AdPerformanceTable({ initialRecords }: AdPerformanceTableProps) {
  const [records, setRecords] = React.useState<AdPerformanceRecord[]>(initialRecords);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = React.useState("ALL");
  const [loading, setLoading] = React.useState(false);

  // Modals
  const [isManualOpen, setIsManualOpen] = React.useState(false);
  const [isCsvOpen, setIsCsvOpen] = React.useState(false);

  React.useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const fetchRecords = async (prodId = selectedProductId) => {
    setLoading(true);
    const data = await getAdPerformanceRecords({
      productId: prodId !== "ALL" ? prodId : undefined,
    });
    setRecords(data);
    setLoading(false);
  };

  const handleProductFilter = (prodId: string) => {
    setSelectedProductId(prodId);
    fetchRecords(prodId);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this daily ad performance record?")) {
      await deleteAdPerformanceRecord(id);
      fetchRecords(selectedProductId);
    }
  };

  const summary = aggregateAdPerformance(records);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Ad Spend &amp; Performance Tracking
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daily logs, Meta Ads CSV batch import &amp; pure unit ratios (CTR, CPC, CPL) (FR-19, FR-20, FR-21)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsCsvOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-subtle hover:bg-surface border border-border text-foreground text-xs font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import Meta CSV</span>
          </button>

          <button
            onClick={() => setIsManualOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Log Daily Spend</span>
          </button>
        </div>
      </div>

      {/* Aggregate Summary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-surface border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Total Spend</span>
            <DollarSign className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-lg font-mono font-bold text-foreground mt-1 tabular-nums">
            {formatCurrency(summary.totalSpend)}
          </p>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Total Leads</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-lg font-mono font-bold text-emerald-400 mt-1 tabular-nums">
            {summary.totalLeads}
          </p>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Blended CPL</span>
            <span className="text-[10px] font-mono text-muted-foreground">Spend / Leads</span>
          </div>
          <p className="text-lg font-mono font-bold text-purple-400 mt-1 tabular-nums">
            {formatCurrency(summary.blendedCPL)}
          </p>
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Blended CTR / CPC</span>
            <MousePointer className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xs font-mono font-bold text-foreground mt-1.5 tabular-nums">
            CTR: {formatPercent(summary.blendedCTR)} &bull; CPC: {formatCurrency(summary.blendedCPC)}
          </p>
        </div>
      </div>

      {/* Recommendations Banner */}
      <CreativeRecommendationsBanner records={records} />

      {/* Product Filter Bar */}
      <div className="flex items-center gap-1 overflow-x-auto text-xs py-1 border-b border-border pb-3">
        <span className="text-[11px] font-mono text-muted-foreground mr-2">Filter Product:</span>
        <button
          onClick={() => handleProductFilter("ALL")}
          className={`px-2.5 py-1 rounded text-xs transition-colors ${
            selectedProductId === "ALL"
              ? "bg-surface-subtle text-foreground font-semibold border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All Products
        </button>
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => handleProductFilter(p.id)}
            className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
              selectedProductId === p.id
                ? "bg-surface-subtle text-foreground font-semibold border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-muted-foreground">
            Loading performance data...
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              No ad spend recorded yet
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Import a Meta Ads CSV report or log daily spend to monitor CPL.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-subtle text-muted-foreground text-[10px] uppercase border-b border-border">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Product / Creative</th>
                  <th className="py-3 px-4 text-right">Spend (DT)</th>
                  <th className="py-3 px-4 text-right">Impressions</th>
                  <th className="py-3 px-4 text-right">Clicks</th>
                  <th className="py-3 px-4 text-right">CTR %</th>
                  <th className="py-3 px-4 text-right">CPC</th>
                  <th className="py-3 px-4 text-right">Leads</th>
                  <th className="py-3 px-4 text-right">CPL</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-3 px-4 text-foreground whitespace-nowrap">
                      {r.date}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">
                        {r.product?.name || "Product"}
                      </div>
                      {r.creative && (
                        <div className="text-[10px] text-muted-foreground">
                          {r.creative.code} ({r.creative.aspect_ratio})
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-foreground tabular-nums">
                      {formatCurrency(r.spend)}
                    </td>

                    <td className="py-3 px-4 text-right text-muted-foreground tabular-nums">
                      {r.impressions.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right text-muted-foreground tabular-nums">
                      {r.clicks.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right text-foreground tabular-nums">
                      {formatPercent(r.metrics.ctr)}
                    </td>

                    <td className="py-3 px-4 text-right text-foreground tabular-nums">
                      {formatCurrency(r.metrics.cpc)}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-emerald-400 tabular-nums">
                      {r.leads}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-blue-400 tabular-nums">
                      {formatCurrency(r.metrics.cpl)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1 text-muted-foreground hover:text-red-400 rounded transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AdPerformanceManualDialog
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSuccess={() => fetchRecords(selectedProductId)}
      />

      <MetaCsvImportDialog
        isOpen={isCsvOpen}
        onClose={() => setIsCsvOpen(false)}
        onSuccess={() => fetchRecords(selectedProductId)}
      />
    </div>
  );
}
