import { z } from "zod";

export const productStatusEnum = z.enum([
  "IDEA",
  "RESEARCH",
  "READY",
  "TESTING",
  "HOLD",
  "KILL",
  "WINNER",
  "SCALING",
  "FATIGUED",
  "ARCHIVED",
]);

export type ProductStatus = z.infer<typeof productStatusEnum>;

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z.string().optional().nullable(),
  selling_price: z.coerce.number().min(0.001, "Selling price must be greater than 0"),
  product_cost: z.coerce.number().min(0, "Product cost must be >= 0"),
  packaging_cost: z.coerce.number().min(0, "Packaging cost must be >= 0").default(1.5),
  delivery_cost: z.coerce.number().min(0, "Delivery cost must be >= 0").default(7.0),
  return_cost: z.coerce.number().min(0, "Return cost must be >= 0").default(3.5),
  other_fulfillment_cost: z.coerce.number().min(0, "Other costs must be >= 0").default(0.0),
  target_cpl: z.coerce.number().min(0, "Target CPL must be >= 0").default(4.0),
  expected_delivery_rate: z.coerce
    .number()
    .min(0.01, "Delivery rate must be > 0%")
    .max(1.0, "Delivery rate must be <= 100%")
    .default(0.65),
  lead_capacity: z.coerce.number().int().min(1, "Lead capacity must be at least 1").default(50),
  status: productStatusEnum.default("READY"),
  notes: z.string().optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;
