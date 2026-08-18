"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { productTestSchema, type ProductTestInput, type TestStatus } from "@/lib/validations/test";
import type { Database } from "@/lib/supabase/database.types";
import { getProducts, type Product } from "./products";
import { evaluateTestPerformance, type TestPerformanceReport } from "@/lib/engine/test-benchmarks";

export type ProductTest = Database["public"]["Tables"]["product_tests"]["Row"] & {
  product?: Product;
  performance?: TestPerformanceReport;
};

// In-memory fallback testing campaigns
let memoryTests: (Database["public"]["Tables"]["product_tests"]["Row"] & {
  actuals: {
    adSpend: number;
    leads: number;
    confirmedOrders: number;
    deliveredOrders: number;
    returnedOrders: number;
  };
})[] = [
  {
    id: "test-1",
    product_id: "prod-1",
    start_date: new Date(Date.now() - 86400000 * 4).toISOString().split("T")[0],
    end_date: null,
    budget: 150.0,
    target_leads: 40,
    target_cpl: 3.8,
    expected_delivery_rate: 0.7,
    target_profit_per_order: 18.0,
    planned_creative_quantity: 3,
    notes: "Testing hook angles: 1) pothole test, 2) magnetic snap speed",
    status: "RUNNING",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    actuals: {
      adSpend: 85.0,
      leads: 26,
      confirmedOrders: 20,
      deliveredOrders: 14,
      returnedOrders: 2,
    },
  },
  {
    id: "test-2",
    product_id: "prod-2",
    start_date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    end_date: null,
    budget: 100.0,
    target_leads: 25,
    target_cpl: 4.0,
    expected_delivery_rate: 0.65,
    target_profit_per_order: 22.0,
    planned_creative_quantity: 2,
    notes: "Initial pain-point test for office lumbar support",
    status: "RUNNING",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    actuals: {
      adSpend: 42.0,
      leads: 9,
      confirmedOrders: 6,
      deliveredOrders: 3,
      returnedOrders: 1,
    },
  },
];

/**
 * Retrieves all product tests with populated product info and computed benchmark reports
 */
export async function getProductTests(statusFilter?: string): Promise<ProductTest[]> {
  const products = await getProducts();
  const productMap = new Map(products.map((p) => [p.id, p]));

  let rawTests: any[] = [];

  try {
    const supabase = await createServerSupabaseClient();
    let query = (supabase.from("product_tests") as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "ALL") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      rawTests = statusFilter && statusFilter !== "ALL"
        ? memoryTests.filter((t) => t.status === statusFilter)
        : memoryTests;
    } else {
      rawTests = data;
    }
  } catch {
    rawTests = statusFilter && statusFilter !== "ALL"
      ? memoryTests.filter((t) => t.status === statusFilter)
      : memoryTests;
  }

  return rawTests.map((test) => {
    const product = productMap.get(test.product_id) || {
      id: test.product_id,
      name: "Unknown Product",
      sku: "N/A",
      selling_price: 50.0,
      product_cost: 15.0,
      packaging_cost: 1.5,
      delivery_cost: 7.0,
      return_cost: 3.5,
      other_fulfillment_cost: 0.0,
      target_cpl: test.target_cpl,
      expected_delivery_rate: test.expected_delivery_rate,
      lead_capacity: 50,
      status: "TESTING",
      notes: null,
      created_at: test.created_at,
      updated_at: test.created_at,
    };

    const actuals = test.actuals || {
      adSpend: 0,
      leads: 0,
      confirmedOrders: 0,
      deliveredOrders: 0,
      returnedOrders: 0,
    };

    const performance = evaluateTestPerformance(
      {
        budget: test.budget,
        targetLeads: test.target_leads,
        targetCpl: test.target_cpl,
        expectedDeliveryRate: test.expected_delivery_rate,
        targetProfitPerOrder: test.target_profit_per_order,
      },
      {
        adSpend: actuals.adSpend,
        leads: actuals.leads,
        confirmedOrders: actuals.confirmedOrders,
        deliveredOrders: actuals.deliveredOrders,
        returnedOrders: actuals.returnedOrders,
        sellingPrice: product.selling_price,
        productCost: product.product_cost,
        packagingCost: product.packaging_cost,
        deliveryCost: product.delivery_cost,
        returnCost: product.return_cost,
        otherCosts: product.other_fulfillment_cost,
      }
    );

    return {
      ...test,
      product,
      performance,
    };
  });
}

/**
 * Creates a new bounded test campaign
 */
export async function createProductTest(
  rawInput: ProductTestInput
): Promise<{ success: boolean; data?: ProductTest; error?: string }> {
  const parsed = productTestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid input",
    };
  }

  const newTest: any = {
    id: `test-${Date.now()}`,
    product_id: parsed.data.product_id,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date || null,
    budget: parsed.data.budget,
    target_leads: parsed.data.target_leads,
    target_cpl: parsed.data.target_cpl,
    expected_delivery_rate: parsed.data.expected_delivery_rate,
    target_profit_per_order: parsed.data.target_profit_per_order,
    planned_creative_quantity: parsed.data.planned_creative_quantity,
    notes: parsed.data.notes || null,
    status: parsed.data.status,
    created_at: new Date().toISOString(),
    actuals: {
      adSpend: 0,
      leads: 0,
      confirmedOrders: 0,
      deliveredOrders: 0,
      returnedOrders: 0,
    },
  };

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await (supabase.from("product_tests") as any)
      .insert(newTest)
      .select()
      .single();

    if (error) {
      memoryTests = [newTest, ...memoryTests];
    } else if (data) {
      memoryTests = [newTest, ...memoryTests];
    }
  } catch {
    memoryTests = [newTest, ...memoryTests];
  }

  revalidatePath("/testing");
  revalidatePath("/");
  return { success: true, data: newTest };
}

/**
 * Updates status of a test campaign
 */
export async function updateTestStatus(
  id: string,
  newStatus: TestStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("product_tests") as any)
      .update({
        status: newStatus,
        end_date: newStatus === "COMPLETED" ? new Date().toISOString().split("T")[0] : null,
      })
      .eq("id", id);
  } catch {
    // ignore
  }

  memoryTests = memoryTests.map((t) =>
    t.id === id
      ? {
          ...t,
          status: newStatus,
          end_date: newStatus === "COMPLETED" ? new Date().toISOString().split("T")[0] : t.end_date,
        }
      : t
  );

  revalidatePath("/testing");
  revalidatePath("/");
  return { success: true };
}

/**
 * Deletes a test campaign
 */
export async function deleteProductTest(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.from("product_tests") as any).delete().eq("id", id);
  } catch {
    // ignore
  }

  memoryTests = memoryTests.filter((t) => t.id !== id);
  revalidatePath("/testing");
  revalidatePath("/");
  return { success: true };
}
