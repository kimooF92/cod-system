export interface ParsedMetaAdRow {
  campaignName: string;
  adSetName: string;
  adName: string;
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  raw: Record<string, string>;
}

export interface CsvParseResult {
  success: boolean;
  rows: ParsedMetaAdRow[];
  totalSpend: number;
  totalLeads: number;
  errors: string[];
}

/**
 * Normalizes header string for robust matching
 */
function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, " ")
    .replace(/[()]/g, "");
}

/**
 * Parses raw Meta Ads CSV export string into standardized ad performance rows (FR-21)
 */
export function parseMetaAdsCsv(csvContent: string): CsvParseResult {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      success: false,
      rows: [],
      totalSpend: 0,
      totalLeads: 0,
      errors: ["CSV file is empty or missing data rows."],
    };
  }

  // Parse CSV line taking quotes into account
  const parseLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const normHeaders = headers.map(normalizeHeader);

  // Column Index Resolvers
  const findCol = (candidates: string[]): number => {
    for (const c of candidates) {
      const idx = normHeaders.findIndex((h) => h.includes(c));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const campIdx = findCol(["campaign name", "nom de la campagne", "campaign"]);
  const adSetIdx = findCol(["ad set name", "adset name", "nom de l'ensemble", "ensemble"]);
  const adIdx = findCol(["ad name", "nom de la publicite", "publicite", "ad"]);
  const dateIdx = findCol(["reporting starts", "day", "date", "jour", "starts"]);
  const spendIdx = findCol([
    "amount spent",
    "montant depense",
    "spend",
    "depense",
    "cost",
  ]);
  const impIdx = findCol(["impressions", "impression"]);
  const clickIdx = findCol(["link clicks", "clics sur un lien", "clicks", "clics"]);
  const leadIdx = findCol(["results", "resultats", "leads", "prospects", "purchases"]);

  if (spendIdx === -1) {
    return {
      success: false,
      rows: [],
      totalSpend: 0,
      totalLeads: 0,
      errors: [
        "Could not detect 'Amount Spent' / 'Montant dépensé' column in CSV headers.",
      ],
    };
  }

  const rows: ParsedMetaAdRow[] = [];
  const errors: string[] = [];
  let totalSpend = 0;
  let totalLeads = 0;

  const today = new Date().toISOString().split("T")[0];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = parseLine(lines[i]);
    if (rawCols.length < 2) continue;

    const rawObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rawObj[h] = rawCols[idx] || "";
    });

    const cleanNumber = (val: string | undefined): number => {
      if (!val) return 0;
      const cleaned = val.replace(/[^0-9.-]+/g, "");
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    const spend = cleanNumber(rawCols[spendIdx]);
    const impressions = Math.round(cleanNumber(rawCols[impIdx]));
    const clicks = Math.round(cleanNumber(rawCols[clickIdx]));
    const leads = Math.round(cleanNumber(rawCols[leadIdx]));

    let dateVal = dateIdx !== -1 && rawCols[dateIdx] ? rawCols[dateIdx] : today;
    // Format date if YYYY-MM-DD or MM/DD/YYYY
    if (dateVal.includes("/")) {
      const parts = dateVal.split("/");
      if (parts.length === 3) {
        if (parts[2].length === 4) {
          dateVal = `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
        }
      }
    }

    const campaignName = campIdx !== -1 && rawCols[campIdx] ? rawCols[campIdx] : "Meta Ads Campaign";
    const adSetName = adSetIdx !== -1 && rawCols[adSetIdx] ? rawCols[adSetIdx] : "Broad Audience";
    const adName = adIdx !== -1 && rawCols[adIdx] ? rawCols[adIdx] : "Ad Creative";

    totalSpend += spend;
    totalLeads += leads;

    rows.push({
      campaignName,
      adSetName,
      adName,
      date: dateVal,
      spend,
      impressions,
      clicks,
      leads,
      raw: rawObj,
    });
  }

  return {
    success: rows.length > 0,
    rows,
    totalSpend,
    totalLeads,
    errors,
  };
}
