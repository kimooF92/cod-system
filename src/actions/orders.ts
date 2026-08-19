"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  orderInputSchema,
  sanitizeTunisianPhone,
  type OrderInput,
  type OrderStatus,
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
