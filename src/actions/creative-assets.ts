"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  creativeAssetSchema,
  type CreativeAssetInput,
  type CreativeLifecycleStatus,
  type PerformanceTag,
} from "@/lib/validations/creative-asset";
import type { Database } from "@/lib/supabase/database.types";
import { getProducts, type Product } from "./products";
import { getMarketingAngles, type MarketingAngle } from "./creatives";

export type CreativeAsset = Database["public"]["Tables"]["creative_assets"]["Row"] & {
  product?: Product;
  angle?: MarketingAngle;
};

// In-memory fallback creative assets
let memoryAssets: Database["public"]["Tables"]["creative_assets"]["Row"][] = [
  {
    id: "asset-1",
    code: "CR-001",
    product_id: "prod-1",
    angle_id: "angle-1",
    hook_id: "hook-1",
    asset_type: "VIDEO",
    aspect_ratio: "9:16",
    creator_source: "In-House UGC",
    media_url: "https://example.com/videos/cr-001.mp4",
    thumbnail_url: null,
    primary_hook_text: "Tired of your phone flying across the car every time you hit a pothole?",
    lifecycle_status: "ACTIVE",
    performance_tag: "WINNER",
    notes: "Top performing UGC demonstration video on TikTok & Reels",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "asset-2",
    code: "CR-002",
    product_id: "prod-1",
    angle_id: "angle-1",
    hook_id: "hook-2",
    asset_type: "VIDEO",
    aspect_ratio: "9:16",
    creator_source: "Freelance Editor",
    media_url: "https://example.com/videos/cr-002.mp4",
    thumbnail_url: null,
    primary_hook_text: "We tested 10 phone mounts on Tunis roads. Only 1 didn't drop the phone.",
    lifecycle_status: "TESTING",
    performance_tag: "KEEP",
    notes: "Split screen comparison test ad",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "asset-3",
    code: "CR-003",
    product_id: "prod-2",
    angle_id: "angle-2",
    hook_id: "hook-3",
    asset_type: "IMAGE",
    aspect_ratio: "1:1",
    creator_source: "Design Agency",
    media_url: "https://example.com/images/cr-003.jpg",
    thumbnail_url: null,
    primary_hook_text: "If your lower back hurts at 4 PM every workday, stop ignoring this signal.",
    lifecycle_status: "TESTING",
    performance_tag: "KEEP",
    notes: "Infographic feature breakdown graphic",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

/**
 * Returns the next sequential creative asset code (e.g. CR-004)
 */
export async function getNextCreativeCode(): Promise<string> {
  let codes: string[] = [];

  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await (supabase.from("creative_assets") as any).select("code");
    if (data && data.length > 0) {
      codes = data.map((r: any) => r.code as string);
    } else {
      codes = memoryAssets.map((a) => a.code);
    }
  } catch {
    codes = memoryAssets.map((a) => a.code);
  }

  // Extract numeric suffixes from codes like "CR-001"
  const nums = codes
    .map((c) => {
      const match = c.match(/CR-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));

  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `CR-${String(next).padStart(3, "0")}`;
}

/**
 * Retrieves all creative assets with populated product & angle metadata
 */
export async function getCreativeAssets(filters?: {
  productId?: string;
  status?: string;
  tag?: string;
}): Promise<CreativeAsset[]> {
  const products = await getProducts();
  const productMap = new Map(products.map((p) => [p.id, p]));
  const angles = await getMarketingAngles();
  const angleMap = new Map(angles.map((a) => [a.id, a]));

  let rawAssets: any[] = [];

  try {
    const supabase = await createServerSupabaseClient();
    let query = (supabase.from("creative_assets") as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.productId && filters.productId !== "ALL") {
      query = query.eq("product_id", filters.productId);
    }
    if (filters?.status && filters.status !== "ALL") {
      query = query.eq("lifecycle_status", filters.status);
    }
    if (filters?.tag && filters.tag !== "ALL") {
      query = query.eq("performance_tag", filters.tag);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      rawAssets = filterMemoryAssets(filters);
    } else {
      rawAssets = data;
    }
  } catch {
    rawAssets = filterMemoryAssets(filters);
  }

  return rawAssets.map((asset) => ({
    ...asset,
    product: productMap.get(asset.product_id),
    angle: asset.angle_id ? angleMap.get(asset.angle_id) : undefined,
  }));
}

function filterMemoryAssets(filters?: { productId?: string; status?: string; tag?: string }) {
  let result = memoryAssets;
  if (filters?.productId && filters.productId !== "ALL") {
    result = result.filter((a) => a.product_id === filters.productId);
  }
  if (filters?.status && filters.status !== "ALL") {
    result = result.filter((a) => a.lifecycle_status === filters.status);
  }
  if (filters?.tag && filters.tag !== "ALL") {
    result = result.filter((a) => a.performance_tag === filters.tag);
  }
  return result;
}

/**
 * Registers a new creative asset in the library (FR-16)
 */
export async function createCreativeAsset(
  rawInput: CreativeAssetInput
): Promise<{ success: boolean; data?: CreativeAsset; error?: string }> {
  const parsed = creativeAssetSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid asset input",
    };
  }

  const newAsset: Database["public"]["Tables"]["creative_assets"]["Row"] = {
    id: `asset-${Date.now()}`,
    code: parsed.data.code.toUpperCase(),
    product_id: parsed.data.product_id,
    angle_id: parsed.data.angle_id || null,
    hook_id: parsed.data.hook_id || null,
    asset_type: parsed.data.asset_type,
    aspect_ratio: parsed.data.aspect_ratio,
    creator_source: parsed.data.creator_source,
    media_url: parsed.data.media_url || null,
    thumbnail_url: parsed.data.thumbnail_url || null,
    primary_hook_text: parsed.data.primary_hook_text || null,
    lifecycle_status: parsed.data.lifecycle_status,
    performance_tag: parsed.data.performance_tag,
    notes: parsed.data.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await (supabase.from("creative_assets") as any).insert(newAsset);
    if (error) {
      memoryAssets = [newAsset, ...memoryAssets];
    } else {
      memoryAssets = [newAsset, ...memoryAssets];
    }
  } catch {
    memoryAssets = [newAsset, ...memoryAssets];
  }

  revalidatePath("/creatives");
  return { success: true, data: newAsset as any };
}

/**
 * Updates status or performance tag of a creative asset (FR-17)
 */
export async function updateCreativeAssetStatus(
  id: string,
  updates: {
    lifecycle_status?: CreativeLifecycleStatus;
    performance_tag?: PerformanceTag;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("creative_assets") as any)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
  } catch {
    // ignore
  }

  memoryAssets = memoryAssets.map((a) =>
    a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a
  );

  revalidatePath("/creatives");
  return { success: true };
}

/**
 * Deletes a creative asset
 */
export async function deleteCreativeAsset(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("creative_assets") as any).delete().eq("id", id);
  } catch {
    // ignore
  }

  memoryAssets = memoryAssets.filter((a) => a.id !== id);
  revalidatePath("/creatives");
  return { success: true };
}
