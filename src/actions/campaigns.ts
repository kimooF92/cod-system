"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  adCampaignSchema,
  adSetSchema,
  adSchema,
  type AdCampaignInput,
  type AdSetInput,
  type AdInput,
  type CampaignStatus,
} from "@/lib/validations/campaign";
import type { Database } from "@/lib/supabase/database.types";
import { getProducts, type Product } from "./products";
import { getCreativeAssets, type CreativeAsset } from "./creative-assets";

export type AdItem = Database["public"]["Tables"]["ads"]["Row"] & {
  product?: Product;
  creative?: CreativeAsset;
};

export type AdSetItem = Database["public"]["Tables"]["ad_sets"]["Row"] & {
  ads: AdItem[];
};

export type CampaignHierarchy = Database["public"]["Tables"]["ad_campaigns"]["Row"] & {
  ad_sets: AdSetItem[];
};

// In-memory fallback campaign hierarchy
let memoryCampaigns: CampaignHierarchy[] = [
  {
    id: "camp-1",
    name: "CBO - Phone Mount Scale Tunisia",
    platform: "META_ADS",
    objective: "SCALING",
    daily_budget: 120.0,
    status: "ACTIVE",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    ad_sets: [
      {
        id: "adset-1",
        campaign_id: "camp-1",
        name: "Broad Men 22-55 Auto Placements",
        audience_targeting: "All Tunisia, Age 22-55, Men, Advantage+ Placements",
        daily_budget: 60.0,
        status: "ACTIVE",
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        ads: [
          {
            id: "ad-1",
            ad_set_id: "adset-1",
            name: "CR-001 - Pothole Speed Test UGC",
            product_id: "prod-1",
            creative_id: "asset-1",
            status: "ACTIVE",
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          },
          {
            id: "ad-2",
            ad_set_id: "adset-1",
            name: "CR-002 - Comparison 10 Mounts",
            product_id: "prod-1",
            creative_id: "asset-2",
            status: "ACTIVE",
            created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
            updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          },
        ],
      },
      {
        id: "adset-2",
        campaign_id: "camp-1",
        name: "Bolt & Taxi Drivers Interest",
        audience_targeting: "Tunis, Sousse, Sfax, Taxi / Rideshare Interest",
        daily_budget: 60.0,
        status: "ACTIVE",
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        ads: [
          {
            id: "ad-3",
            ad_set_id: "adset-2",
            name: "CR-001 - Pothole Speed Test UGC",
            product_id: "prod-1",
            creative_id: "asset-1",
            status: "ACTIVE",
            created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
            updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
          },
        ],
      },
    ],
  },
  {
    id: "camp-2",
    name: "ABO - Lumbar Cushion Angle Testing",
    platform: "META_ADS",
    objective: "TESTING",
    daily_budget: 45.0,
    status: "ACTIVE",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    ad_sets: [
      {
        id: "adset-3",
        campaign_id: "camp-2",
        name: "Desk Workers 25-45",
        audience_targeting: "Tunisia Major Cities, Age 25-45, Office / Desk Work",
        daily_budget: 45.0,
        status: "ACTIVE",
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        ads: [
          {
            id: "ad-4",
            ad_set_id: "adset-3",
            name: "CR-003 - 4 PM Back Pain Infographic",
            product_id: "prod-2",
            creative_id: "asset-3",
            status: "ACTIVE",
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
        ],
      },
    ],
  },
];

/**
 * Retrieves full campaign hierarchy tree (Campaigns -> Ad Sets -> Ads)
 */
export async function getCampaignHierarchy(): Promise<CampaignHierarchy[]> {
  const products = await getProducts();
  const productMap = new Map(products.map((p) => [p.id, p]));
  const assets = await getCreativeAssets();
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  let rawCampaigns = memoryCampaigns;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: camps, error: campErr } = await (supabase.from("ad_campaigns") as any)
      .select("*, ad_sets(*, ads(*))")
      .order("created_at", { ascending: false });

    if (!campErr && camps && camps.length > 0) {
      rawCampaigns = camps.map((c: any) => ({
        ...c,
        ad_sets: (c.ad_sets || []).map((as: any) => ({
          ...as,
          ads: as.ads || [],
        })),
      }));
    }
  } catch {
    rawCampaigns = memoryCampaigns;
  }

  // Populate product & creative asset objects on ads
  return rawCampaigns.map((camp) => ({
    ...camp,
    ad_sets: camp.ad_sets.map((adSet) => ({
      ...adSet,
      ads: adSet.ads.map((ad) => ({
        ...ad,
        product: productMap.get(ad.product_id),
        creative: assetMap.get(ad.creative_id),
      })),
    })),
  }));
}

/**
 * Creates a new ad campaign (FR-18)
 */
export async function createCampaign(
  rawInput: AdCampaignInput
): Promise<{ success: boolean; data?: any; error?: string }> {
  const parsed = adCampaignSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid campaign input",
    };
  }

  const newCampaign: CampaignHierarchy = {
    id: `camp-${Date.now()}`,
    name: parsed.data.name,
    platform: parsed.data.platform,
    objective: parsed.data.objective,
    daily_budget: parsed.data.daily_budget,
    status: parsed.data.status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ad_sets: [],
  };

  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("ad_campaigns") as any).insert(newCampaign);
  } catch {
    // ignore
  }

  memoryCampaigns = [newCampaign, ...memoryCampaigns];
  revalidatePath("/creatives");
  return { success: true, data: newCampaign };
}

/**
 * Creates an ad set under a campaign
 */
export async function createAdSet(
  rawInput: AdSetInput
): Promise<{ success: boolean; data?: any; error?: string }> {
  const parsed = adSetSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid ad set input",
    };
  }

  const newAdSet: AdSetItem = {
    id: `adset-${Date.now()}`,
    campaign_id: parsed.data.campaign_id,
    name: parsed.data.name,
    audience_targeting: parsed.data.audience_targeting,
    daily_budget: parsed.data.daily_budget || null,
    status: parsed.data.status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ads: [],
  };

  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("ad_sets") as any).insert(newAdSet);
  } catch {
    // ignore
  }

  memoryCampaigns = memoryCampaigns.map((camp) =>
    camp.id === parsed.data.campaign_id
      ? { ...camp, ad_sets: [...camp.ad_sets, newAdSet] }
      : camp
  );

  revalidatePath("/creatives");
  return { success: true, data: newAdSet };
}

/**
 * Creates an ad mapped to an ad set, product, and creative asset
 */
export async function createAd(
  rawInput: AdInput
): Promise<{ success: boolean; data?: any; error?: string }> {
  const parsed = adSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid ad input",
    };
  }

  const newAd: AdItem = {
    id: `ad-${Date.now()}`,
    ad_set_id: parsed.data.ad_set_id,
    name: parsed.data.name,
    product_id: parsed.data.product_id,
    creative_id: parsed.data.creative_id,
    status: parsed.data.status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("ads") as any).insert(newAd);
  } catch {
    // ignore
  }

  memoryCampaigns = memoryCampaigns.map((camp) => ({
    ...camp,
    ad_sets: camp.ad_sets.map((adSet) =>
      adSet.id === parsed.data.ad_set_id
        ? { ...adSet, ads: [...adSet.ads, newAd] }
        : adSet
    ),
  }));

  revalidatePath("/creatives");
  return { success: true, data: newAd };
}

/**
 * Deletes a campaign and cascades to its ad sets and ads
 */
export async function deleteCampaign(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("ad_campaigns") as any).delete().eq("id", id);
  } catch {
    // ignore
  }

  memoryCampaigns = memoryCampaigns.filter((c) => c.id !== id);
  revalidatePath("/creatives");
  return { success: true };
}

/**
 * Deletes an ad set
 */
export async function deleteAdSet(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("ad_sets") as any).delete().eq("id", id);
  } catch {
    // ignore
  }

  memoryCampaigns = memoryCampaigns.map((camp) => ({
    ...camp,
    ad_sets: camp.ad_sets.filter((as) => as.id !== id),
  }));

  revalidatePath("/creatives");
  return { success: true };
}

/**
 * Deletes an ad
 */
export async function deleteAd(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("ads") as any).delete().eq("id", id);
  } catch {
    // ignore
  }

  memoryCampaigns = memoryCampaigns.map((camp) => ({
    ...camp,
    ad_sets: camp.ad_sets.map((as) => ({
      ...as,
      ads: as.ads.filter((a) => a.id !== id),
    })),
  }));

  revalidatePath("/creatives");
  return { success: true };
}
