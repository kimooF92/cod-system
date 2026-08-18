"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  researchItemSchema,
  type ResearchItemInput,
  type ResearchStatus,
} from "@/lib/validations/research";
import type { Database } from "@/lib/supabase/database.types";

export type ResearchItem = Database["public"]["Tables"]["research_items"]["Row"];

// In-memory fallback store for initial local development before Supabase DB setup
let memoryStore: ResearchItem[] = [
  {
    id: "res-1",
    market: "Tunisia",
    problem: "Poor posture and lower back fatigue during long office hours",
    target_customer: "Desk workers and drivers (25–45)",
    pain_point: "Chronic lumbar soreness by 3 PM",
    promise: "Immediate spinal relief with dynamic memory honeycomb grid",
    competitors: "Generic foam cushions on Facebook Marketplace",
    estimated_cost: 22.0,
    estimated_price: 69.0,
    creative_opportunities: "Before/after posture demo, egg drop shock absorption video",
    source: "TikTok Ad Spy / AliExpress Trending",
    notes: "Supplier confirmed 4-day restock availability in Tunis",
    status: "READY_FOR_TEST",
    converted_product_id: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "res-2",
    market: "Tunisia",
    problem: "Car dashboard phone mounts keep dropping phones on rough roads",
    target_customer: "Bolt/taxi drivers & daily commuters",
    pain_point: "Phone falls during navigation calls",
    promise: "Vacuum-suction + 20x magnetic locking ring",
    competitors: "Cheap spring clip vents",
    estimated_cost: 14.5,
    estimated_price: 49.0,
    creative_opportunities: "Pothole road test video, 1-second snap on/off hook",
    source: "Facebook Ads Library",
    notes: "Targeting driver groups",
    status: "VALIDATING",
    converted_product_id: null,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

/**
 * Retrieves research items filtered optionally by status
 */
export async function getResearchItems(statusFilter?: string): Promise<ResearchItem[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = (supabase.from("research_items") as any).select("*").order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "ALL") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      if (statusFilter && statusFilter !== "ALL") {
        return memoryStore.filter((item) => item.status === statusFilter);
      }
      return memoryStore;
    }
    return data as ResearchItem[];
  } catch {
    if (statusFilter && statusFilter !== "ALL") {
      return memoryStore.filter((item) => item.status === statusFilter);
    }
    return memoryStore;
  }
}

/**
 * Creates a new research item
 */
export async function createResearchItem(rawInput: ResearchItemInput): Promise<{ success: boolean; data?: ResearchItem; error?: string }> {
  const parsed = researchItemSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  const newItem: ResearchItem = {
    id: `res-${Date.now()}`,
    market: parsed.data.market,
    problem: parsed.data.problem,
    target_customer: parsed.data.target_customer,
    pain_point: parsed.data.pain_point,
    promise: parsed.data.promise,
    competitors: parsed.data.competitors || null,
    estimated_cost: parsed.data.estimated_cost,
    estimated_price: parsed.data.estimated_price,
    creative_opportunities: parsed.data.creative_opportunities || null,
    source: parsed.data.source || null,
    notes: parsed.data.notes || null,
    status: parsed.data.status,
    converted_product_id: null,
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await (supabase.from("research_items") as any).insert(newItem).select().single();
    if (error) {
      memoryStore = [newItem, ...memoryStore];
    } else if (data) {
      memoryStore = [data as ResearchItem, ...memoryStore];
    }
  } catch {
    memoryStore = [newItem, ...memoryStore];
  }

  revalidatePath("/research");
  return { success: true, data: newItem };
}

/**
 * Updates status of a research item
 */
export async function updateResearchStatus(id: string, newStatus: ResearchStatus): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await (supabase.from("research_items") as any).update({ status: newStatus }).eq("id", id);
    if (error) {
      memoryStore = memoryStore.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
    }
  } catch {
    memoryStore = memoryStore.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
  }

  revalidatePath("/research");
  return { success: true };
}

/**
 * Deletes a research item
 */
export async function deleteResearchItem(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("research_items") as any).delete().eq("id", id);
  } catch {
    // ignore
  }
  memoryStore = memoryStore.filter((item) => item.id !== id);
  revalidatePath("/research");
  return { success: true };
}
