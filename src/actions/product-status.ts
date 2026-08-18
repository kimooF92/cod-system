"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProductStatus } from "@/lib/validations/product";
import type { Database } from "@/lib/supabase/database.types";
import { updateProduct, getProducts } from "./products";

export type ProductStatusHistory = Database["public"]["Tables"]["product_status_history"]["Row"];

// In-memory fallback history store
let memoryStatusHistory: ProductStatusHistory[] = [
  {
    id: "hist-1",
    product_id: "prod-1",
    previous_status: "TESTING",
    new_status: "WINNER",
    reason: "Consistent 72% delivery rate and net profit > 300 DT across 48 leads",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "hist-2",
    product_id: "prod-1",
    previous_status: "READY",
    new_status: "TESTING",
    reason: "Launched test campaign with 3 video angles",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "hist-3",
    product_id: "prod-2",
    previous_status: "RESEARCH",
    new_status: "READY",
    reason: "Supplier pricing confirmed at 22 DT; gross margin 68%",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

/**
 * Updates a product's status and records an append-only audit trail record (FR-11, AD-3)
 */
export async function updateProductStatusWithHistory(
  productId: string,
  newStatus: ProductStatus,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  // Get current product status
  const products = await getProducts();
  const product = products.find((p) => p.id === productId);
  const previousStatus = product ? product.status : null;

  const reasonText = reason?.trim() || "Manual status override";

  const historyRecord: ProductStatusHistory = {
    id: `hist-${Date.now()}`,
    product_id: productId,
    previous_status: previousStatus,
    new_status: newStatus,
    reason: reasonText,
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = await createServerSupabaseClient();
    
    // Update product table
    await (supabase.from("products") as any)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", productId);

    // Insert history record
    const { error: histError } = await (supabase.from("product_status_history") as any)
      .insert(historyRecord);

    if (histError) {
      memoryStatusHistory = [historyRecord, ...memoryStatusHistory];
    }
  } catch {
    memoryStatusHistory = [historyRecord, ...memoryStatusHistory];
  }

  // Update memory store as well
  await updateProduct(productId, { status: newStatus });

  revalidatePath("/products");
  revalidatePath("/");
  return { success: true };
}

/**
 * Retrieves the full chronological audit history for a given product
 */
export async function getProductStatusHistory(
  productId: string
): Promise<ProductStatusHistory[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await (supabase.from("product_status_history") as any)
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return memoryStatusHistory.filter((h) => h.product_id === productId);
    }
    return data as ProductStatusHistory[];
  } catch {
    return memoryStatusHistory.filter((h) => h.product_id === productId);
  }
}
