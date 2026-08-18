"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  adPerformanceDailySchema,
  type AdPerformanceDailyInput,
} from "@/lib/validations/ad-performance";
import type { Database } from "@/lib/supabase/database.types";
import { getProducts, type Product } from "./products";
import { getCreativeAssets, type CreativeAsset } from "./creative-assets";
import { getCampaignHierarchy, type CampaignHierarchy } from "./campaigns";
import { calculateAdMetrics, type ComputedAdMetrics } from "@/lib/engine/ad-metrics";
import type { ParsedMetaAdRow } from "@/lib/engine/csv-parser";

export type AdPerformanceRecord = Database["public"]["Tables"]["ad_performance_daily"]["Row"] & {
  product?: Product;
  creative?: CreativeAsset;
  metrics: ComputedAdMetrics;
};

// In-memory fallback daily ad performance store
let memoryAdPerformance: Database["public"]["Tables"]["ad_performance_daily"]["Row"][] = [
  {
    id: "perf-1",
    ad_id: "ad-1",
    campaign_id: "camp-1",
    creative_id: "asset-1",
    product_id: "prod-1",
    date: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0],
    spend: 48.0,
    impressions: 3450,
    clicks: 112,
    leads: 15,
    notes: "Meta Ads daily performance",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "perf-2",
    ad_id: "ad-2",
    campaign_id: "camp-1",
    creative_id: "asset-2",
    product_id: "prod-1",
    date: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0],
    spend: 37.0,
    impressions: 2100,
    clicks: 64,
    leads: 11,
    notes: "Meta Ads daily performance",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "perf-3",
    ad_id: "ad-4",
    campaign_id: "camp-2",
    creative_id: "asset-3",
    product_id: "prod-2",
    date: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0],
    spend: 42.0,
    impressions: 2900,
    clicks: 78,
    leads: 9,
    notes: "Meta Ads daily performance",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

/**
 * Retrieves daily ad performance records with populated metadata and calculated ratios
 */
export async function getAdPerformanceRecords(filters?: {
  productId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AdPerformanceRecord[]> {
  const products = await getProducts();
  const productMap = new Map(products.map((p) => [p.id, p]));
  const assets = await getCreativeAssets();
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  let rawRecords: any[] = [];

  try {
    const supabase = await createServerSupabaseClient();
    let query = (supabase.from("ad_performance_daily") as any)
      .select("*")
      .order("date", { ascending: false });

    if (filters?.productId && filters.productId !== "ALL") {
      query = query.eq("product_id", filters.productId);
    }
    if (filters?.startDate) {
      query = query.gte("date", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("date", filters.endDate);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      rawRecords = filterMemoryRecords(filters);
    } else {
      rawRecords = data;
    }
  } catch {
    rawRecords = filterMemoryRecords(filters);
  }

  return rawRecords.map((r) => {
    const metrics = calculateAdMetrics({
      spend: r.spend,
      impressions: r.impressions,
      clicks: r.clicks,
      leads: r.leads,
    });

    return {
      ...r,
      product: productMap.get(r.product_id),
      creative: r.creative_id ? assetMap.get(r.creative_id) : undefined,
      metrics,
    };
  });
}

function filterMemoryRecords(filters?: { productId?: string; startDate?: string; endDate?: string }) {
  let res = memoryAdPerformance;
  if (filters?.productId && filters.productId !== "ALL") {
    res = res.filter((r) => r.product_id === filters.productId);
  }
  if (filters?.startDate) {
    res = res.filter((r) => r.date >= filters.startDate!);
  }
  if (filters?.endDate) {
    res = res.filter((r) => r.date <= filters.endDate!);
  }
  return res;
}

/**
 * Creates a single daily ad performance record manually (FR-19)
 */
export async function createAdPerformanceRecord(
  rawInput: AdPerformanceDailyInput
): Promise<{ success: boolean; data?: any; error?: string }> {
  const parsed = adPerformanceDailySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid performance input",
    };
  }

  const newRecord: Database["public"]["Tables"]["ad_performance_daily"]["Row"] = {
    id: `perf-${Date.now()}`,
    ad_id: parsed.data.ad_id || null,
    campaign_id: parsed.data.campaign_id || null,
    creative_id: parsed.data.creative_id || null,
    product_id: parsed.data.product_id,
    date: parsed.data.date,
    spend: parsed.data.spend,
    impressions: parsed.data.impressions,
    clicks: parsed.data.clicks,
    leads: parsed.data.leads,
    notes: parsed.data.notes || null,
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("ad_performance_daily") as any).insert(newRecord);
  } catch {
    // ignore
  }

  memoryAdPerformance = [newRecord, ...memoryAdPerformance];
  revalidatePath("/analytics");
  revalidatePath("/creatives");
  revalidatePath("/");
  return { success: true, data: newRecord };
}

/**
 * Batch imports parsed Meta Ads CSV rows (FR-21)
 */
export async function batchImportAdPerformance(
  rows: ParsedMetaAdRow[],
  defaultProductId: string
): Promise<{ success: boolean; importedCount: number; error?: string }> {
  if (!rows || rows.length === 0) {
    return { success: false, importedCount: 0, error: "No rows provided for import" };
  }

  const newRecords: Database["public"]["Tables"]["ad_performance_daily"]["Row"][] = rows.map(
    (row, idx) => ({
      id: `perf-import-${Date.now()}-${idx}`,
      ad_id: null,
      campaign_id: null,
      creative_id: null,
      product_id: defaultProductId,
      date: row.date,
      spend: row.spend,
      impressions: row.impressions,
      clicks: row.clicks,
      leads: row.leads,
      notes: `Meta CSV Import: ${row.campaignName} > ${row.adSetName} > ${row.adName}`,
      created_at: new Date().toISOString(),
    })
  );

  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("ad_performance_daily") as any).insert(newRecords);
  } catch {
    // ignore
  }

  memoryAdPerformance = [...newRecords, ...memoryAdPerformance];
  revalidatePath("/analytics");
  revalidatePath("/creatives");
  revalidatePath("/");
  return { success: true, importedCount: newRecords.length };
}

/**
 * Deletes an ad performance entry
 */
export async function deleteAdPerformanceRecord(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("ad_performance_daily") as any).delete().eq("id", id);
  } catch {
    // ignore
  }

  memoryAdPerformance = memoryAdPerformance.filter((r) => r.id !== id);
  revalidatePath("/analytics");
  revalidatePath("/creatives");
  return { success: true };
}
