"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  orderInputSchema,
  sanitizeTunisianPhone,
  type OrderInput,
  type OrderStatus,
  reconcileOrderSchema,
  type ReconcileOrderInput,
  batchDispatchSchema,
  type BatchDispatchInput,
} from "@/lib/validations/order";
import type { Database } from "@/lib/supabase/database.types";
import { getProducts, type Product } from "./products";
import { getCreativeAssets, type CreativeAsset } from "./creative-assets";

export type Order = Database["public"]["Tables"]["orders"]["Row"] & {
  product?: Product;
  creative?: CreativeAsset;
};

// In-memory fallback orders store
let memoryOrders: Database["public"]["Tables"]["orders"]["Row"][] = [
  {
    id: "ord-1",
    order_number: "ORD-2026-00101",
    customer_name: "Yassine Ben Amor",
    phone: "22345678",
    governorate: "Tunis",
    address: "15 Avenue Habib Bourguiba, Centre Ville",
    product_id: "prod-1",
    quantity: 1,
    unit_price: 49.0,
    delivery_fee: 7.0,
    total_amount: 56.0,
    status: "NEW_ORDER",
    attempt_count: 0,
    last_contact_at: null,
    next_follow_up_at: null,
    courier_name: null,
    tracking_code: null,
    return_reason: null,
    return_fee: 3.5,
    source: "Manual Intake",
    creative_id: "asset-1",
    notes: "Customer wants delivery before 2 PM",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "ord-2",
    order_number: "ORD-2026-00102",
    customer_name: "Marwa Trabelsi",
    phone: "50987654",
    governorate: "Sousse",
    address: "Rue Ibn Khaldoun, Khezama",
    product_id: "prod-2",
    quantity: 2,
    unit_price: 69.0,
    delivery_fee: 7.0,
    total_amount: 145.0,
    status: "CONFIRMED",
    attempt_count: 1,
    last_contact_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    next_follow_up_at: null,
    courier_name: "Aramex Tunisia",
    tracking_code: "ARX-TN-98214",
    return_reason: null,
    return_fee: 3.5,
    source: "TikTok Ad",
    creative_id: "asset-3",
    notes: "Confirmed by phone, packaging double bubble wrap",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "ord-3",
    order_number: "ORD-2026-00103",
    customer_name: "Karim Gharbi",
    phone: "98112233",
    governorate: "Sfax",
    address: "Route Teniour Km 3",
    product_id: "prod-1",
    quantity: 1,
    unit_price: 49.0,
    delivery_fee: 7.0,
    total_amount: 56.0,
    status: "DELIVERED",
    attempt_count: 1,
    last_contact_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    next_follow_up_at: null,
    courier_name: "First Delivery Express",
    tracking_code: "FDX-77412",
    return_reason: null,
    return_fee: 3.5,
    source: "Meta Ad",
    creative_id: "asset-1",
    notes: "Collected cash 56 DT successfully",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

let nextOrderSeq = 104;

/**
 * Retrieves all orders with product and creative metadata
 */
export async function getOrders(filters?: {
  productId?: string;
  status?: string;
  governorate?: string;
  search?: string;
}): Promise<Order[]> {
  const products = await getProducts();
  const productMap = new Map(products.map((p) => [p.id, p]));
  const assets = await getCreativeAssets();
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  let rawOrders: any[] = [];

  try {
    const supabase = await createServerSupabaseClient();
    let query = (supabase.from("orders") as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.productId && filters.productId !== "ALL") {
      query = query.eq("product_id", filters.productId);
    }
    if (filters?.status && filters.status !== "ALL") {
      query = query.eq("status", filters.status);
    }
    if (filters?.governorate && filters.governorate !== "ALL") {
      query = query.eq("governorate", filters.governorate);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      rawOrders = filterMemoryOrders(filters);
    } else {
      rawOrders = data;
    }
  } catch {
    rawOrders = filterMemoryOrders(filters);
  }

  return rawOrders.map((o) => ({
    ...o,
    product: productMap.get(o.product_id),
    creative: o.creative_id ? assetMap.get(o.creative_id) : undefined,
  }));
}

function filterMemoryOrders(filters?: {
  productId?: string;
  status?: string;
  governorate?: string;
  search?: string;
}) {
  let result = memoryOrders;
  if (filters?.productId && filters.productId !== "ALL") {
    result = result.filter((o) => o.product_id === filters.productId);
  }
  if (filters?.status && filters.status !== "ALL") {
    result = result.filter((o) => o.status === filters.status);
  }
  if (filters?.governorate && filters.governorate !== "ALL") {
    result = result.filter((o) => o.governorate === filters.governorate);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.address.toLowerCase().includes(q)
    );
  }
  return result;
}

/**
 * Creates a new COD order via fast manual intake (FR-23, FR-24)
 */
export async function createOrder(
  rawInput: OrderInput
): Promise<{ success: boolean; data?: Order; error?: string }> {
  const parsed = orderInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid order input",
    };
  }

  const sanitizedPhone = sanitizeTunisianPhone(parsed.data.phone);
  const totalAmount =
    parsed.data.quantity * parsed.data.unit_price + parsed.data.delivery_fee;
  const orderNumber = `ORD-2026-00${nextOrderSeq++}`;

  const newOrder: Database["public"]["Tables"]["orders"]["Row"] = {
    id: `ord-${Date.now()}`,
    order_number: orderNumber,
    customer_name: parsed.data.customer_name,
    phone: sanitizedPhone,
    governorate: parsed.data.governorate,
    address: parsed.data.address,
    product_id: parsed.data.product_id,
    quantity: parsed.data.quantity,
    unit_price: parsed.data.unit_price,
    delivery_fee: parsed.data.delivery_fee,
    total_amount: totalAmount,
    status: "NEW_ORDER",
    attempt_count: 0,
    last_contact_at: null,
    next_follow_up_at: null,
    courier_name: null,
    tracking_code: null,
    return_reason: null,
    return_fee: 3.5,
    source: parsed.data.source || "Manual Intake",
    creative_id: parsed.data.creative_id || null,
    notes: parsed.data.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("orders") as any).insert(newOrder);
  } catch {
    // ignore
  }

  memoryOrders = [newOrder, ...memoryOrders];
  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true, data: newOrder as any };
}

/**
 * Updates an order status with attempt tracking (FR-25)
 */
export async function updateOrderStatus(
  id: string,
  newStatus: OrderStatus,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();

  try {
    const supabase = await createServerSupabaseClient();
    const { data: existing } = await (supabase.from("orders") as any)
      .select("attempt_count")
      .eq("id", id)
      .single();

    const newAttempts = (existing?.attempt_count || 0) + (newStatus === "NO_ANSWER" || newStatus === "CONFIRMED" ? 1 : 0);

    await (supabase.from("orders") as any)
      .update({
        status: newStatus,
        attempt_count: newAttempts,
        last_contact_at: now,
        notes: notes ? notes : undefined,
        updated_at: now,
      })
      .eq("id", id);
  } catch {
    // ignore
  }

  memoryOrders = memoryOrders.map((o) => {
    if (o.id === id) {
      const newAttempts = o.attempt_count + (newStatus === "NO_ANSWER" || newStatus === "CONFIRMED" ? 1 : 0);
      return {
        ...o,
        status: newStatus,
        attempt_count: newAttempts,
        last_contact_at: now,
        notes: notes !== undefined ? notes : o.notes,
        updated_at: now,
      };
    }
    return o;
  });

  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true };
}

/**
 * Logs a call attempt and schedules the next follow-up timestamp (FR-27)
 */
export async function logCallAttemptAndSchedule(
  id: string,
  preset: "IN_2_HOURS" | "IN_4_HOURS" | "TOMORROW_MORNING" | "TOMORROW_AFTERNOON",
  notes?: string
): Promise<{ success: boolean; newAttemptCount: number; nextFollowUpAt: string; error?: string }> {
  const { computeFollowUpTimestamp } = await import("@/lib/engine/followup-rules");
  const now = new Date().toISOString();
  const nextFollowUpAt = computeFollowUpTimestamp(preset);

  let newAttempts = 1;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: existing } = await (supabase.from("orders") as any)
      .select("attempt_count")
      .eq("id", id)
      .single();

    newAttempts = (existing?.attempt_count || 0) + 1;

    await (supabase.from("orders") as any)
      .update({
        status: "NO_ANSWER",
        attempt_count: newAttempts,
        last_contact_at: now,
        next_follow_up_at: nextFollowUpAt,
        notes: notes ? notes : undefined,
        updated_at: now,
      })
      .eq("id", id);
  } catch {
    // ignore
  }

  memoryOrders = memoryOrders.map((o) => {
    if (o.id === id) {
      newAttempts = o.attempt_count + 1;
      return {
        ...o,
        status: "NO_ANSWER" as OrderStatus,
        attempt_count: newAttempts,
        last_contact_at: now,
        next_follow_up_at: nextFollowUpAt,
        notes: notes !== undefined ? notes : o.notes,
        updated_at: now,
      };
    }
    return o;
  });

  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true, newAttemptCount: newAttempts, nextFollowUpAt };
}

/**
 * 1-Click cancellation of all orders reaching 3 failed attempts (FR-28)
 */
export async function cancelMaxAttemptOrders(): Promise<{
  success: boolean;
  cancelledCount: number;
  error?: string;
}> {
  const now = new Date().toISOString();
  const targetIds = memoryOrders
    .filter((o) => o.attempt_count >= 3 && (o.status === "NO_ANSWER" || o.status === "NEW_ORDER"))
    .map((o) => o.id);

  if (targetIds.length === 0) {
    return { success: true, cancelledCount: 0 };
  }

  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("orders") as any)
      .update({
        status: "CANCELLED",
        return_reason: "3 Failed Call Attempts",
        updated_at: now,
      })
      .in("id", targetIds);
  } catch {
    // ignore
  }

  memoryOrders = memoryOrders.map((o) =>
    targetIds.includes(o.id)
      ? {
          ...o,
          status: "CANCELLED" as OrderStatus,
          return_reason: "3 Failed Call Attempts",
          updated_at: now,
        }
      : o
  );

  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true, cancelledCount: targetIds.length };
}

/**
 * Batch updates multiple orders to a new status
 */
export async function batchUpdateOrderStatus(
  ids: string[],
  newStatus: OrderStatus
): Promise<{ success: boolean; updatedCount: number; error?: string }> {
  if (!ids || ids.length === 0) return { success: true, updatedCount: 0 };
  const now = new Date().toISOString();

  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("orders") as any)
      .update({
        status: newStatus,
        updated_at: now,
      })
      .in("id", ids);
  } catch {
    // ignore
  }

  memoryOrders = memoryOrders.map((o) =>
    ids.includes(o.id)
      ? {
          ...o,
          status: newStatus,
          updated_at: now,
        }
      : o
  );

  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true, updatedCount: ids.length };
}

/**
 * Deletes an order
 */
export async function deleteOrder(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("orders") as any).delete().eq("id", id);
  } catch {
    // ignore
  }

  memoryOrders = memoryOrders.filter((o) => o.id !== id);
  revalidatePath("/orders");
  return { success: true };
}

/**
 * Reconciles an order's courier assignment, delivery outcome, or return details (FR-27, FR-28)
 */
export async function reconcileCourierDelivery(
  id: string,
  rawInput: ReconcileOrderInput
): Promise<{ success: boolean; data?: Database["public"]["Tables"]["orders"]["Row"]; error?: string }> {
  const parsed = reconcileOrderSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid reconciliation payload",
    };
  }

  const { status, courier_name, tracking_code, return_reason, return_fee, notes } = parsed.data;
  const now = new Date().toISOString();

  const updates: Partial<Database["public"]["Tables"]["orders"]["Row"]> = {
    status,
    updated_at: now,
  };

  if (courier_name !== undefined) updates.courier_name = courier_name;
  if (tracking_code !== undefined) updates.tracking_code = tracking_code;
  if (notes !== undefined && notes !== null) updates.notes = notes;

  if (status === "RETURNED") {
    updates.return_reason = return_reason || "Customer Refused on Delivery";
    updates.return_fee = return_fee ?? 3.5;
  } else if (status === "CANCELLED") {
    updates.return_reason = return_reason || "Cancelled by Operator";
  }

  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("orders") as any)
      .update(updates)
      .eq("id", id);
  } catch {
    // ignore
  }

  let updatedOrder: Database["public"]["Tables"]["orders"]["Row"] | undefined;
  memoryOrders = memoryOrders.map((o) => {
    if (o.id === id) {
      updatedOrder = {
        ...o,
        ...updates,
      };
      return updatedOrder;
    }
    return o;
  });

  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true, data: updatedOrder };
}

/**
 * Batch dispatches confirmed orders to a designated courier
 */
export async function batchDispatchOrders(
  rawInput: BatchDispatchInput
): Promise<{ success: boolean; dispatchedCount: number; error?: string }> {
  const parsed = batchDispatchSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      dispatchedCount: 0,
      error: parsed.error.errors[0]?.message || "Invalid batch dispatch input",
    };
  }

  const { order_ids, courier_name, notes } = parsed.data;
  const now = new Date().toISOString();

  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("orders") as any)
      .update({
        status: "DISPATCHED",
        courier_name,
        notes: notes || undefined,
        updated_at: now,
      })
      .in("id", order_ids);
  } catch {
    // ignore
  }

  memoryOrders = memoryOrders.map((o) => {
    if (order_ids.includes(o.id)) {
      return {
        ...o,
        status: "DISPATCHED" as OrderStatus,
        courier_name,
        notes: notes !== undefined && notes !== null ? notes : o.notes,
        updated_at: now,
      };
    }
    return o;
  });

  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true, dispatchedCount: order_ids.length };
}

/**
 * Ingests a batch of validated external order leads from Google Sheets or Webhook (FR-26, ARCH-4)
 */
export async function syncExternalOrders(
  ordersToIngest: OrderInput[]
): Promise<{ success: boolean; createdCount: number; orders?: Order[]; error?: string }> {
  if (!ordersToIngest || ordersToIngest.length === 0) {
    return { success: true, createdCount: 0 };
  }

  const createdRows: Database["public"]["Tables"]["orders"]["Row"][] = [];
  const now = new Date().toISOString();

  for (const input of ordersToIngest) {
    const totalAmount = input.quantity * input.unit_price + input.delivery_fee;
    const orderNumber = `ORD-2026-00${nextOrderSeq++}`;

    const newRow: Database["public"]["Tables"]["orders"]["Row"] = {
      id: `ord-sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      order_number: orderNumber,
      customer_name: input.customer_name,
      phone: input.phone,
      governorate: input.governorate,
      address: input.address,
      product_id: input.product_id,
      quantity: input.quantity,
      unit_price: input.unit_price,
      delivery_fee: input.delivery_fee,
      total_amount: totalAmount,
      status: "NEW_ORDER",
      attempt_count: 0,
      last_contact_at: null,
      next_follow_up_at: null,
      courier_name: null,
      tracking_code: null,
      return_reason: null,
      return_fee: 3.5,
      source: input.source || "Google Sheets",
      creative_id: input.creative_id || null,
      notes: input.notes || "Synced from Google Sheets",
      created_at: now,
      updated_at: now,
    };

    createdRows.push(newRow);
  }

  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("orders") as any).insert(createdRows);
  } catch {
    // ignore
  }

  memoryOrders = [...createdRows, ...memoryOrders];

  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true, createdCount: createdRows.length, orders: createdRows as any };
}


