import { safeDivide } from "./calculations";

export interface RawAdMetricsInput {
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
}

export interface ComputedAdMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  ctr: number | null; // Clicks / Impressions
  cpc: number | null; // Spend / Clicks
  cpl: number | null; // Spend / Leads
}

export interface AggregatedAdMetrics {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalLeads: number;
  blendedCTR: number | null;
  blendedCPC: number | null;
  blendedCPL: number | null;
  recordsCount: number;
}

/**
 * Computes single-row ad performance ratios (FR-20).
 * AD-1 Pure calculation logic: zero DB dependencies, unit-safe math.
 */
export function calculateAdMetrics(raw: RawAdMetricsInput): ComputedAdMetrics {
  const ctr = safeDivide(raw.clicks, raw.impressions);
  const cpc = safeDivide(raw.spend, raw.clicks);
  const cpl = safeDivide(raw.spend, raw.leads);

  return {
    spend: raw.spend,
    impressions: raw.impressions,
    clicks: raw.clicks,
    leads: raw.leads,
    ctr,
    cpc,
    cpl,
  };
}

/**
 * Aggregates a list of daily ad performance records into a blended summary.
 */
export function aggregateAdPerformance(
  records: RawAdMetricsInput[]
): AggregatedAdMetrics {
  let totalSpend = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalLeads = 0;

  for (const r of records) {
    totalSpend += r.spend || 0;
    totalImpressions += r.impressions || 0;
    totalClicks += r.clicks || 0;
    totalLeads += r.leads || 0;
  }

  const blendedCTR = safeDivide(totalClicks, totalImpressions);
  const blendedCPC = safeDivide(totalSpend, totalClicks);
  const blendedCPL = safeDivide(totalSpend, totalLeads);

  return {
    totalSpend,
    totalImpressions,
    totalClicks,
    totalLeads,
    blendedCTR,
    blendedCPC,
    blendedCPL,
    recordsCount: records.length,
  };
}
