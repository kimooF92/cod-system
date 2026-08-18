import { z } from "zod";

export const testStatusEnum = z.enum(["RUNNING", "COMPLETED", "CANCELLED"]);

export type TestStatus = z.infer<typeof testStatusEnum>;

export const productTestSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  start_date: z.string().default(() => new Date().toISOString().split("T")[0]),
  end_date: z.string().optional().nullable(),
  budget: z.coerce.number().min(10.0, "Budget cap must be at least 10 DT"),
  target_leads: z.coerce.number().int().min(5, "Target leads must be at least 5"),
  target_cpl: z.coerce.number().min(0.5, "Target CPL must be at least 0.5 DT"),
  expected_delivery_rate: z.coerce
    .number()
    .min(0.1, "Delivery rate must be >= 10%")
    .max(1.0, "Delivery rate must be <= 100%")
    .default(0.65),
  target_profit_per_order: z.coerce
    .number()
    .min(1.0, "Target profit per delivered order must be at least 1.0 DT")
    .default(15.0),
  planned_creative_quantity: z.coerce
    .number()
    .int()
    .min(1, "At least 1 creative angle planned")
    .default(3),
  notes: z.string().optional().nullable(),
  status: testStatusEnum.default("RUNNING"),
});

export type ProductTestInput = z.infer<typeof productTestSchema>;
