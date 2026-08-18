"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculateProductScore, type ProductScoreResult } from "@/lib/engine/product-scoring";
import { getProducts, type Product } from "./products";
import { calculateUnitEconomics } from "@/lib/engine/unit-economics";

/**
 * Calculates a product's composite score and dimension breakdown
 */
export async function getProductScore(product: Product): Promise<ProductScoreResult> {
  const eco = calculateUnitEconomics({
    sellingPrice: product.selling_price,
    productCost: product.product_cost,
    packagingCost: product.packaging_cost,
    deliveryCost: product.delivery_cost,
    returnCost: product.return_cost,
    otherCost: product.other_fulfillment_cost,
    targetCpl: product.target_cpl,
    expectedDeliveryRate: product.expected_delivery_rate,
  });

  return calculateProductScore({
    targetCpl: product.target_cpl,
    actualCpl: product.status === "WINNER" ? product.target_cpl * 0.85 : product.target_cpl,
    expectedProfitPerDeliveredOrder: eco.estimatedNetProfitPerDeliveredOrder,
    expectedDeliveryRate: product.expected_delivery_rate,
    actualDeliveryRate: product.status === "WINNER" ? product.expected_delivery_rate + 0.05 : product.expected_delivery_rate,
    expectedConfirmationRate: 0.75,
    creativePotentialScore: product.status === "WINNER" ? 90 : 75,
  });
}

/**
 * Retrieves scores for all products in catalog
 */
export async function getAllProductScores(): Promise<Record<string, ProductScoreResult>> {
  const products = await getProducts();
  const scores: Record<string, ProductScoreResult> = {};

  for (const product of products) {
    scores[product.id] = await getProductScore(product);
  }

  return scores;
}
