"use client";

import * as React from "react";
import {
  X,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Layers,
  ArrowRight,
  Code2,
} from "lucide-react";
import {
  parseDelimitedText,
  processSheetSyncRows,
  type SheetColumnMapping,
  type ParsedSheetRow,
  type SyncResult,
} from "@/lib/engine/sheets-sync";
import { syncExternalOrders, type Order } from "@/actions/orders";
import type { Product } from "@/actions/products";
import { formatCurrency } from "@/lib/utils";

interface SheetsSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingOrders: Order[];
  products: Product[];
}

export function SheetsSyncDialog({
  isOpen,
  onClose,
  onSuccess,
  existingOrders,
  products,
}: SheetsSyncDialogProps) {
  const [activeMode, setActiveMode] = React.useState<"paste" | "url" | "webhook">("paste");
  const [sheetUrl, setSheetUrl] = React.useState("");
  const [rawText, setRawText] = React.useState("");
  const [parsedHeaders, setParsedHeaders] = React.useState<string[]>([]);
  const [rawRows, setRawRows] = React.useState<Record<string, string>[]>([]);
  const [defaultProductId, setDefaultProductId] = React.useState(products[0]?.id || "prod-1");

  // Column Mapping state
  const [nameCol, setNameCol] = React.useState("");
  const [phoneCol, setPhoneCol] = React.useState("");
  const [govCol, setGovCol] = React.useState("");
  const [addressCol, setAddressCol] = React.useState("");
  const [productCol, setProductCol] = React.useState("");
  const [qtyCol, setQtyCol] = React.useState("");
  const [priceCol, setPriceCol] = React.useState("");
  const [mappingRestored, setMappingRestored] = React.useState(false);

  // Restore saved column mapping from localStorage on open
  React.useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem("cod-sheets-mapping");
      if (saved) {
        const m = JSON.parse(saved);
        if (m.nameCol) setNameCol(m.nameCol);
        if (m.phoneCol) setPhoneCol(m.phoneCol);
        if (m.govCol) setGovCol(m.govCol);
        if (m.addressCol) setAddressCol(m.addressCol);
        if (m.productCol) setProductCol(m.productCol);
        if (m.qtyCol) setQtyCol(m.qtyCol);
        if (m.priceCol) setPriceCol(m.priceCol);
        setMappingRestored(true);
      }
    } catch {}
  }, [isOpen]);

  const [syncPreview, setSyncPreview] = React.useState<SyncResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedScript, setCopiedScript] = React.useState(false);

  // Sample data button for fast demo
  const loadSampleSheetData = () => {
    const sample = `Customer Name\tPhone\tGovernorate\tAddress\tQuantity\tPrice
Amine Ben Salem\t+216 23 456 789\tTunis\t25 Rue de Marseille\t1\t49.000
Sarra Mansour\t54 112 233\tSousse\tAvenue Taieb Mhiri\t2\t89.000
Mohamed Dridi\t98765432\tSfax\tRoute el Ain Km 2\t1\t49.000
Yassine Ben Amor\t22345678\tTunis\tCentre Ville\t1\t49.000`;
    setRawText(sample);
  };

  // Parse text when rawText changes
  React.useEffect(() => {
    if (rawText) {
      const { headers, rows } = parseDelimitedText(rawText);
      setParsedHeaders(headers);
      setRawRows(rows);

      // Auto-assign column mappings
      headers.forEach((h) => {
        const lower = h.toLowerCase();
        if (lower.includes("name") || lower.includes("nom") || lower.includes("client")) {
          setNameCol(h);
        } else if (lower.includes("phone") || lower.includes("tel") || lower.includes("num")) {
          setPhoneCol(h);
        } else if (lower.includes("gov") || lower.includes("ville") || lower.includes("city")) {
          setGovCol(h);
        } else if (lower.includes("addr") || lower.includes("adr")) {
          setAddressCol(h);
        } else if (lower.includes("prod") || lower.includes("article") || lower.includes("sku")) {
          setProductCol(h);
        } else if (lower.includes("qty") || lower.includes("quant")) {
          setQtyCol(h);
        } else if (lower.includes("price") || lower.includes("prix") || lower.includes("total")) {
          setPriceCol(h);
        }
      });
    } else {
      setParsedHeaders([]);
      setRawRows([]);
      setSyncPreview(null);
    }
  }, [rawText]);

  // Update sync preview when mappings change
  React.useEffect(() => {
    if (rawRows.length > 0 && nameCol && phoneCol) {
      const mapping: SheetColumnMapping = {
        customerNameCol: nameCol,
        phoneCol: phoneCol,
        governorateCol: govCol,
        addressCol: addressCol,
        productCol: productCol || undefined,
        quantityCol: qtyCol || undefined,
        unitPriceCol: priceCol || undefined,
      };

      const selectedProd = products.find((p) => p.id === defaultProductId);
      const defaultPrice = selectedProd?.selling_price ? Number(selectedProd.selling_price) : 49.0;

      const preview = processSheetSyncRows(
        rawRows,
        mapping,
        existingOrders,
        defaultProductId,
        defaultPrice
      );
      setSyncPreview(preview);
    } else {
      setSyncPreview(null);
    }
  }, [rawRows, nameCol, phoneCol, govCol, addressCol, productCol, qtyCol, priceCol, defaultProductId, existingOrders, products]);

  if (!isOpen) return null;

  const handleFetchUrl = async () => {
    if (!sheetUrl) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(sheetUrl);
      if (!res.ok) throw new Error(`Failed to fetch sheet: HTTP ${res.status}`);
      const text = await res.text();
      setRawText(text);
      setActiveMode("paste");
    } catch (err: any) {
      setError(err.message || "Failed to fetch published Google Sheet URL. Ensure the sheet is Published to Web as CSV.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommitSync = async () => {
    if (!syncPreview || syncPreview.validOrders.length === 0) return;
    setImporting(true);
    setError(null);

    try {
      const res = await syncExternalOrders(syncPreview.validOrders);
      if (!res.success) {
        setError(res.error || "Failed to import synced orders");
      } else {
        // Save column mapping to localStorage for next time
        try {
          localStorage.setItem(
            "cod-sheets-mapping",
            JSON.stringify({ nameCol, phoneCol, govCol, addressCol, productCol, qtyCol, priceCol })
          );
        } catch {}
        onSuccess();
        onClose();
      }
    } catch {
      setError("An unexpected error occurred during sync import.");
    } finally {
      setImporting(false);
    }
  };

  const copyAppsScriptSnippet = () => {
    const script = `// Google Apps Script: Auto-sync on form submit or row edit
function onFormSubmit(e) {
  var url = "${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/sync/orders";
  var rowData = {
    customer_name: e.namedValues['Full Name'] ? e.namedValues['Full Name'][0] : '',
    phone: e.namedValues['Phone Number'] ? e.namedValues['Phone Number'][0] : '',
    governorate: e.namedValues['Governorate'] ? e.namedValues['Governorate'][0] : 'Tunis',
    address: e.namedValues['Address'] ? e.namedValues['Address'][0] : '',
    product_id: "${defaultProductId}",
    quantity: 1,
    source: "Google Sheets Webhook"
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(rowData)
  };

  UrlFetchApp.fetch(url, options);
}`;
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-subtle shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Google Sheets Real-Time Order Sync
              </h3>
              <p className="text-xs text-muted-foreground">
                Import and de-duplicate live customer leads from Google Sheets or Webhook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-border/50 bg-surface shrink-0">
          <button
            type="button"
            onClick={() => setActiveMode("paste")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeMode === "paste"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Paste / CSV Input</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("url")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeMode === "url"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Published Sheet URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("webhook")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeMode === "webhook"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Apps Script Webhook</span>
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode 1: Paste CSV / TSV */}
          {activeMode === "paste" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Paste Sheet Content (CSV or Tab-Delimited text from Google Sheets / Excel)
                </label>
                <button
                  type="button"
                  onClick={loadSampleSheetData}
                  className="text-[11px] text-emerald-400 hover:underline font-mono"
                >
                  Load Sample Data
                </button>
              </div>

              <textarea
                rows={4}
                placeholder="Paste rows with headers (e.g. Name, Phone, Governorate, Address...)"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full font-mono text-xs bg-surface-subtle border border-border rounded-lg p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
              />
            </div>
          )}

          {/* Mode 2: Published Sheet URL */}
          {activeMode === "url" && (
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground">
                Published Google Sheet Web CSV URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="flex-1 font-mono text-xs bg-surface-subtle border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleFetchUrl}
                  disabled={loading || !sheetUrl}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>{loading ? "Fetching..." : "Fetch Sheet"}</span>
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                In Google Sheets: Click <strong>File &gt; Share &gt; Publish to web</strong> &gt; Select Sheet &gt; Choose <strong>Comma-separated values (.csv)</strong>.
              </p>
            </div>
          )}

          {/* Mode 3: Webhook Script */}
          {activeMode === "webhook" && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-subtle border border-border rounded-lg space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-foreground">Real-Time Google Apps Script Webhook Setup</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyAppsScriptSnippet}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? "Copied Script!" : "Copy Script Code"}</span>
                  </button>
                </div>

                {/* 3 Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-surface border border-border rounded-lg space-y-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">STEP 1</span>
                    <p className="text-[11px] font-semibold text-foreground">Open Apps Script</p>
                    <p className="text-[10px] text-muted-foreground">
                      In your Google Sheet, click <strong>Extensions &gt; Apps Script</strong>.
                    </p>
                  </div>

                  <div className="p-3 bg-surface border border-border rounded-lg space-y-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">STEP 2</span>
                    <p className="text-[11px] font-semibold text-foreground">Paste Script Code</p>
                    <p className="text-[10px] text-muted-foreground">
                      Click the button above to copy, then paste into <strong>Code.gs</strong>.
                    </p>
                  </div>

                  <div className="p-3 bg-surface border border-border rounded-lg space-y-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">STEP 3</span>
                    <p className="text-[11px] font-semibold text-foreground">Add Trigger</p>
                    <p className="text-[10px] text-muted-foreground">
                      Go to ⏰ <strong>Triggers</strong> &gt; Add trigger for <code className="text-emerald-400">onFormSubmit</code> on <strong>Form submit</strong>.
                    </p>
                  </div>
                </div>

                {/* Webhook Endpoint & Target Product */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 bg-surface rounded border border-border font-mono text-[11px] space-y-1">
                    <span className="text-[10px] text-muted-foreground block">Webhook Endpoint:</span>
                    <span className="text-emerald-400 font-bold break-all">
                      {typeof window !== "undefined" ? window.location.origin : "https://your-domain.vercel.app"}/api/sync/orders
                    </span>
                  </div>

                  <div className="p-2.5 bg-surface rounded border border-border space-y-1 text-xs">
                    <span className="text-[10px] text-muted-foreground block font-mono">Assign Synced Leads To:</span>
                    <select
                      value={defaultProductId}
                      onChange={(e) => setDefaultProductId(e.target.value)}
                      className="w-full bg-surface-subtle border border-border rounded px-2 py-1 text-xs text-foreground font-mono"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatCurrency(Number(p.selling_price))})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Script Code Preview */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono text-muted-foreground">Script Preview (Code.gs):</span>
                  <pre className="bg-surface p-3 rounded-lg border border-border font-mono text-[10px] text-muted-foreground overflow-x-auto max-h-40 overflow-y-auto leading-relaxed">
{`function onFormSubmit(e) {
  var url = "${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.vercel.app'}/api/sync/orders";
  var values = e.namedValues || {};
  var payload = {
    customer_name: values['Full Name'] ? values['Full Name'][0] : values['Name'][0],
    phone: values['Phone Number'] ? values['Phone Number'][0] : values['Phone'][0],
    governorate: values['Governorate'] ? values['Governorate'][0] : 'Tunis',
    address: values['Address'] ? values['Address'][0] : 'Centre Ville',
    product_id: "${defaultProductId}",
    quantity: 1,
    source: "Google Sheets Webhook"
  };
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  });
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Column Mapping Section (Visible if headers are detected) */}
          {parsedHeaders.length > 0 && (
            <div className="p-4 bg-surface-subtle border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-foreground">
                    Column Mapping ({parsedHeaders.length} headers detected)
                  </span>
                </div>

                {/* Default Product Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Default Product:</span>
                  <select
                    value={defaultProductId}
                    onChange={(e) => setDefaultProductId(e.target.value)}
                    className="bg-surface border border-border rounded px-2 py-1 text-xs text-foreground font-mono"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatCurrency(Number(p.selling_price))})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Customer Name *
                  </label>
                  <select
                    value={nameCol}
                    onChange={(e) => setNameCol(e.target.value)}
                    className="w-full bg-surface border border-border rounded px-2 py-1.5 text-xs text-foreground font-mono"
                  >
                    <option value="">Select column</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Phone Number *
                  </label>
                  <select
                    value={phoneCol}
                    onChange={(e) => setPhoneCol(e.target.value)}
                    className="w-full bg-surface border border-border rounded px-2 py-1.5 text-xs text-foreground font-mono"
                  >
                    <option value="">Select column</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Governorate
                  </label>
                  <select
                    value={govCol}
                    onChange={(e) => setGovCol(e.target.value)}
                    className="w-full bg-surface border border-border rounded px-2 py-1.5 text-xs text-foreground font-mono"
                  >
                    <option value="">(Auto: Tunis)</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Delivery Address
                  </label>
                  <select
                    value={addressCol}
                    onChange={(e) => setAddressCol(e.target.value)}
                    className="w-full bg-surface border border-border rounded px-2 py-1.5 text-xs text-foreground font-mono"
                  >
                    <option value="">(Auto: City center)</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Sync Stats & Live Preview Table */}
          {syncPreview && (
            <div className="space-y-3">
              {/* Sync Counts Bar */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 bg-surface-subtle border border-border rounded-lg">
                  <span className="text-[10px] text-muted-foreground">Total Rows</span>
                  <p className="text-base font-bold text-foreground">{syncPreview.totalRows}</p>
                </div>
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <span className="text-[10px] text-emerald-400">Ready to Ingest</span>
                  <p className="text-base font-bold text-emerald-400">{syncPreview.validOrders.length}</p>
                </div>
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <span className="text-[10px] text-amber-400">Duplicates Skipped</span>
                  <p className="text-base font-bold text-amber-400">{syncPreview.skippedDuplicates}</p>
                </div>
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <span className="text-[10px] text-red-400">Invalid Rows</span>
                  <p className="text-base font-bold text-red-400">{syncPreview.invalidRows}</p>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-border rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-subtle text-muted-foreground text-[10px] uppercase border-b border-border sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Customer</th>
                      <th className="py-2 px-3">Phone</th>
                      <th className="py-2 px-3">Governorate</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {syncPreview.details.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-surface-subtle/50 transition-colors ${
                          row.isDuplicate
                            ? "bg-amber-500/5"
                            : !row.isValid
                            ? "bg-red-500/5"
                            : ""
                        }`}
                      >
                        <td className="py-2 px-3 whitespace-nowrap">
                          {row.isValid && !row.isDuplicate ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              NEW LEAD
                            </span>
                          ) : row.isDuplicate ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              DUPLICATE
                            </span>
                          ) : (
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/30"
                              title={row.errors.join(", ")}
                            >
                              INVALID
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold text-foreground">
                          {row.normalized?.customer_name || row.raw[nameCol] || "—"}
                        </td>
                        <td className="py-2 px-3 text-blue-400">
                          {row.normalized?.phone || row.raw[phoneCol] || "—"}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {row.normalized?.governorate || "—"}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-400 tabular-nums">
                          {row.normalized
                            ? formatCurrency(row.normalized.quantity * row.normalized.unit_price + row.normalized.delivery_fee)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-subtle shrink-0">
          <div className="text-xs text-muted-foreground">
            {syncPreview && syncPreview.validOrders.length > 0 ? (
              <span>
                Ready to import <strong className="text-foreground">{syncPreview.validOrders.length}</strong> new orders into triage queue.
              </span>
            ) : (
              <span>Select columns to configure sync mapping.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={importing || !syncPreview || syncPreview.validOrders.length === 0}
              onClick={handleCommitSync}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {importing
                  ? "Ingesting..."
                  : `Ingest ${syncPreview?.validOrders.length || 0} Orders`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
