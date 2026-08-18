"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  productSchema,
  type ProductInput,
  type ProductStatus,
} from "@/lib/validations/product";
import type { Database } from "@/lib/supabase/database.types";
import { getResearchItems, updateResearchStatus } from "./research";

export type Product = Database["public"]["Tables"]["products"]["Row"];

// In-memory fallback store for development
let memoryProducts: Product[] = [
  {
    id: "prod-1",
    name: "Magnetic Phone Mount Pro",
    sku: "MPH-PRO-01",
    selling_price: 49.0,
    product_cost: 14.5,
    packaging_cost: 1.5,
    delivery_cost: 7.0,
    return_cost: 3.5,
    other_fulfillment_cost: 0.0,
    target_cpl: 3.5,
    expected_delivery_rate: 0.7,
    lead_capacity: 80,
    status: "WINNER",
    notes: "Top performer with high driver retention",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-2",
    name: "Honeycomb Ergonomic Memory Cushion",
    sku: "CUSH-HONEY-02",
    selling_price: 69.0,
    product_cost: 22.0,
    packaging_cost: 1.5,
    delivery_cost: 7.0,
    return_cost: 3.5,
    other_fulfillment_cost: 0.0,
    target_cpl: 4.5,
    expected_delivery_rate: 0.65,
    lead_capacity: 50,
    status: "TESTING",
    notes: "Converted from research item; testing initial angle",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Retrieves products filtered optionally by status
 */
export async function getProducts(statusFilter?: string): Promise<Product[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = (supabase.from("products") as any)
      .select("*")
      .order("updated_at", { ascending: false });

    if (statusFilter && statusFilter !== "ALL") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      if (statusFilter && statusFilter !== "ALL") {
        return memoryProducts.filter((p) => p.status === statusFilter);
      }
      return memoryProducts;
    }
    return data as Product[];
  } catch {
    if (statusFilter && statusFilter !== "ALL") {
      return memoryProducts.filter((p) => p.status === statusFilter);
    }
    return memoryProducts;
  }
}

/**
 * Creates a new product
 */
export async function createProduct(
  rawInput: ProductInput
): Promise<{ success: boolean; data?: Product; error?: string }> {
  const parsed = productSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid input",
    };
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name: parsed.data.name,
    sku: parsed.data.sku || `SKU-${Date.now().toString().slice(-6)}`,
    selling_price: parsed.data.selling_price,
    product_cost: parsed.data.product_cost,
    packaging_cost: parsed.data.packaging_cost,
    delivery_cost: parsed.data.delivery_cost,
    return_cost: parsed.data.return_cost,
    other_fulfillment_cost: parsed.data.other_fulfillment_cost,
    target_cpl: parsed.data.target_cpl,
    expected_delivery_rate: parsed.data.expected_delivery_rate,
    lead_capacity: parsed.data.lead_capacity,
    status: parsed.data.status,
    notes: parsed.data.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await (supabase.from("products") as any)
      .insert(newProduct)
      .select()
      .single();

    if (error) {
      memoryProducts = [newProduct, ...memoryProducts];
    } else if (data) {
      memoryProducts = [data as Product, ...memoryProducts];
    }
  } catch {
    memoryProducts = [newProduct, ...memoryProducts];
  }

  revalidatePath("/products");
  revalidatePath("/");
  return { success: true, data: newProduct };
}

/**
 * Updates an existing product
 */
export async function updateProduct(
  id: string,
  rawInput: Partial<ProductInput>
): Promise<{ success: boolean; data?: Product; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const updateData = {
      ...rawInput,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (supabase.from("products") as any)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      memoryProducts = memoryProducts.map((p) =>
        p.id === id ? { ...p, ...updateData } : p
      );
    } else if (data) {
      memoryProducts = memoryProducts.map((p) =>
        p.id === id ? (data as Product) : p
      );
    }
  } catch {
    memoryProducts = memoryProducts.map((p) =>
      p.id === id ? { ...p, ...rawInput, updated_at: new Date().toISOString() } : p
    );
  }

  revalidatePath("/products");
  revalidatePath("/");
  return { success: true };
}

/**
 * 1-Click Converts a research item into an active product without re-typing (FR-8)
 */
export async function convertResearchToProduct(
  researchItemId: string
): Promise<{ success: boolean; product?: Product; error?: string }> {
  const researchItems = await getResearchItems();
  const researchItem = researchItems.find((r) => r.id === researchItemId);

  if (!researchItem) {
    return { success: false, error: "Research item not found" };
  }

  const productPayload: ProductInput = {
    name: researchItem.problem ? `${researchItem.promise || "New Product"} (${researchItem.market})` : "New Product",
    sku: `SKU-${Date.now().toString().slice(-6)}`,
    selling_price: researchItem.estimated_price || 50.0,
    product_cost: researchItem.estimated_cost || 15.0,
    packaging_cost: 1.5,
    delivery_cost: 7.0,
    return_cost: 3.5,
    other_fulfillment_cost: 0.0,
    target_cpl: 4.0,
    expected_delivery_rate: 0.65,
    lead_capacity: 50,
    status: "READY",
    notes: `Converted from Research: Target: ${researchItem.target_customer}. Pain: ${researchItem.pain_point}. Notes: ${researchItem.notes || ""}`,
  };

  const created = await createProduct(productPayload);
  if (!created.success || !created.data) {
    return { success: false, error: created.error || "Failed to create product" };
  }

  // Update research item status to CONVERTED
  await updateResearchStatus(researchItemId, "CONVERTED");

  revalidatePath("/research");
  revalidatePath("/products");
  return { success: true, product: created.data };
}

/**
 * Deletes a product
 */
export async function deleteProduct(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("products") as any).delete().eq("id", id);
  } catch {
    // ignore
  }

  memoryProducts = memoryProducts.filter((p) => p.id !== id);
  revalidatePath("/products");
  revalidatePath("/");
  return { success: true };
}
