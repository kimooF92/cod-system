"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  marketingAngleSchema,
  marketingHookSchema,
  type MarketingAngleInput,
  type MarketingHookInput,
} from "@/lib/validations/creative";
import type { Database } from "@/lib/supabase/database.types";
import { getProducts, type Product } from "./products";

export type MarketingAngle = Database["public"]["Tables"]["marketing_angles"]["Row"] & {
  product?: Product;
  hooks: Database["public"]["Tables"]["marketing_hooks"]["Row"][];
};

export type MarketingHook = Database["public"]["Tables"]["marketing_hooks"]["Row"];

// In-memory fallback angle and hook store
let memoryAngles: (Database["public"]["Tables"]["marketing_angles"]["Row"] & {
  hooks: MarketingHook[];
})[] = [
  {
    id: "angle-1",
    product_id: "prod-1",
    name: "Tunisian Pothole Proof Commute",
    pain_point: "Phone constantly falling off dashboard on rough roads and sudden braking",
    promise: "Zero phone drops even on the roughest Tunisian roads with ultra-strong neodymium magnets",
    target_customer_avatar: "Taxi & Bolt Drivers, Daily Car Commuters",
    creative_format: "DEMONSTRATION",
    notes: "Best tested with aggressive speed bump driving video",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    hooks: [
      {
        id: "hook-1",
        angle_id: "angle-1",
        hook_text: "Tired of your phone flying across the car every time you hit a pothole?",
        hook_type: "PROBLEM_AGITATION",
        notes: "Show phone flying off dashboard in first 2 seconds",
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: "hook-2",
        angle_id: "angle-1",
        hook_text: "We tested 10 phone mounts on Tunis roads. Only 1 didn't drop the phone.",
        hook_type: "BOLD_CLAIM",
        notes: "Side-by-side comparison hook",
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
    ],
  },
  {
    id: "angle-2",
    product_id: "prod-2",
    name: "8-Hour Desk Work Pain Relief",
    pain_point: "Severe lower back stiffness and slouching after long office hours",
    promise: "Ergonomic memory foam alignment relieves spinal pressure instantly",
    target_customer_avatar: "Remote Tech Workers, Call Center Agents, Accountants",
    creative_format: "PROBLEM_SOLUTION",
    notes: "Show pressure map animation and posture transformation",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    hooks: [
      {
        id: "hook-3",
        angle_id: "angle-2",
        hook_text: "If your lower back hurts at 4 PM every workday, stop ignoring this signal.",
        hook_type: "QUESTION",
        notes: "Call out 4 PM workday exhaustion",
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
  },
];

/**
 * Retrieves all marketing angles with attached hooks and product metadata
 */
export async function getMarketingAngles(productIdFilter?: string): Promise<MarketingAngle[]> {
  const products = await getProducts();
  const productMap = new Map(products.map((p) => [p.id, p]));

  let rawAngles: any[] = [];

  try {
    const supabase = await createServerSupabaseClient();
    let query = (supabase.from("marketing_angles") as any)
      .select("*, marketing_hooks(*)")
      .order("created_at", { ascending: false });

    if (productIdFilter && productIdFilter !== "ALL") {
      query = query.eq("product_id", productIdFilter);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      rawAngles = productIdFilter && productIdFilter !== "ALL"
        ? memoryAngles.filter((a) => a.product_id === productIdFilter)
        : memoryAngles;
    } else {
      rawAngles = data.map((d: any) => ({
        ...d,
        hooks: d.marketing_hooks || [],
      }));
    }
  } catch {
    rawAngles = productIdFilter && productIdFilter !== "ALL"
      ? memoryAngles.filter((a) => a.product_id === productIdFilter)
      : memoryAngles;
  }

  return rawAngles.map((angle) => ({
    ...angle,
    product: productMap.get(angle.product_id),
    hooks: angle.hooks || [],
  }));
}

/**
 * Creates a new marketing angle
 */
export async function createMarketingAngle(
  rawInput: MarketingAngleInput
): Promise<{ success: boolean; data?: MarketingAngle; error?: string }> {
  const parsed = marketingAngleSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid angle input",
    };
  }

  const newAngle: any = {
    id: `angle-${Date.now()}`,
    product_id: parsed.data.product_id,
    name: parsed.data.name,
    pain_point: parsed.data.pain_point,
    promise: parsed.data.promise,
    target_customer_avatar: parsed.data.target_customer_avatar,
    creative_format: parsed.data.creative_format,
    notes: parsed.data.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    hooks: [],
  };

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await (supabase.from("marketing_angles") as any).insert(newAngle);
    if (error) {
      memoryAngles = [newAngle, ...memoryAngles];
    } else {
      memoryAngles = [newAngle, ...memoryAngles];
    }
  } catch {
    memoryAngles = [newAngle, ...memoryAngles];
  }

  revalidatePath("/creatives");
  return { success: true, data: newAngle };
}

/**
 * Attaches a new opening hook to a marketing angle (FR-14)
 */
export async function createMarketingHook(
  rawInput: MarketingHookInput
): Promise<{ success: boolean; data?: MarketingHook; error?: string }> {
  const parsed = marketingHookSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid hook input",
    };
  }

  const newHook: MarketingHook = {
    id: `hook-${Date.now()}`,
    angle_id: parsed.data.angle_id,
    hook_text: parsed.data.hook_text,
    hook_type: parsed.data.hook_type,
    notes: parsed.data.notes || null,
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await (supabase.from("marketing_hooks") as any).insert(newHook);
    if (error) {
      addHookToMemory(newHook);
    } else {
      addHookToMemory(newHook);
    }
  } catch {
    addHookToMemory(newHook);
  }

  revalidatePath("/creatives");
  return { success: true, data: newHook };
}

function addHookToMemory(hook: MarketingHook) {
  memoryAngles = memoryAngles.map((angle) =>
    angle.id === hook.angle_id
      ? { ...angle, hooks: [hook, ...angle.hooks] }
      : angle
  );
}

/**
 * Deletes a marketing angle and its attached hooks
 */
export async function deleteMarketingAngle(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("marketing_angles") as any).delete().eq("id", id);
  } catch {
    // ignore
  }

  memoryAngles = memoryAngles.filter((a) => a.id !== id);
  revalidatePath("/creatives");
  return { success: true };
}

/**
 * Deletes a single hook
 */
export async function deleteMarketingHook(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("marketing_hooks") as any).delete().eq("id", id);
  } catch {
    // ignore
  }

  memoryAngles = memoryAngles.map((angle) => ({
    ...angle,
    hooks: angle.hooks.filter((h) => h.id !== id),
  }));

  revalidatePath("/creatives");
  return { success: true };
}
