"use client";

import * as React from "react";
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { parseMetaAdsCsv, type ParsedMetaAdRow, type CsvParseResult } from "@/lib/engine/csv-parser";
import { batchImportAdPerformance } from "@/actions/ad-performance";
import { getProducts, type Product } from "@/actions/products";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface MetaCsvImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MetaCsvImportDialog({
  isOpen,
  onClose,
  onSuccess,
}: MetaCsvImportDialogProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [parseResult, setParseResult] = React.useState<CsvParseResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      getProducts().then((prods) => {
        setProducts(prods);
        if (prods.length > 0 && !selectedProductId) {
          setSelectedProductId(prods[0].id);
        }
      });
      setFile(null);
      setParseResult(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseMetaAdsCsv(text);
        if (!parsed.success) {
          setError(parsed.errors.join(". ") || "Failed to parse Meta Ads CSV file");
        }
        setParseResult(parsed);
      }
    };
    reader.readAsText(selected);
  };

  const handleImport = async () => {
    if (!parseResult || parseResult.rows.length === 0 || !selectedProductId) return;

    setLoading(true);
    setError(null);

    const res = await batchImportAdPerformance(parseResult.rows, selectedProductId);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Batch import failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Import Meta Ads Export CSV
              </h3>
              <p className="text-xs text-muted-foreground">
                Auto-detects spend, impressions, link clicks &amp; leads columns
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
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Association */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Attribute Spend To Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku || "NO-SKU"})
                </option>
              ))}
            </select>
          </div>

          {/* File Upload Box */}
          {!parseResult || !parseResult.success ? (
            <label className="border-2 border-dashed border-border hover:border-emerald-500/50 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-surface-subtle/30 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div className="text-center">
                <span className="text-xs font-semibold text-foreground">
                  Click to select Meta Ads Manager export CSV
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Supports English &amp; French Meta reports (Amount Spent, Impressions, Clicks, Results)
                </p>
              </div>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-3">
              {/* Summary Stats */}
              <div className="p-3.5 rounded-lg bg-surface-subtle border border-border flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{parseResult.rows.length} rows parsed cleanly</span>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                    File: {file?.name}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-foreground">
                    Total: {formatCurrency(parseResult.totalSpend)}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                    {parseResult.totalLeads} Leads
                  </div>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-border rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-subtle text-muted-foreground text-[10px] uppercase border-b border-border sticky top-0">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Campaign / Ad</th>
                      <th className="p-2 text-right">Spend</th>
                      <th className="p-2 text-right">Clicks</th>
                      <th className="p-2 text-right">Leads</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parseResult.rows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-surface-subtle/50">
                        <td className="p-2 text-muted-foreground whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="p-2 max-w-[200px] truncate text-foreground">
                          {row.campaignName} &rarr; {row.adName}
                        </td>
                        <td className="p-2 text-right font-bold text-foreground tabular-nums">
                          {formatCurrency(row.spend)}
                        </td>
                        <td className="p-2 text-right text-muted-foreground tabular-nums">
                          {row.clicks}
                        </td>
                        <td className="p-2 text-right text-emerald-400 font-bold tabular-nums">
                          {row.leads}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parseResult.rows.length > 10 && (
                <p className="text-[10px] font-mono text-muted-foreground text-center">
                  + {parseResult.rows.length - 10} more rows ready for batch import
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            {parseResult?.success && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setParseResult(null);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Choose another file
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!parseResult?.success || loading}
                onClick={handleImport}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-sm"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{loading ? "Importing..." : "Confirm Batch Import"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
