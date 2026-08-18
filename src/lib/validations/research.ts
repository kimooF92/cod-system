import { z } from "zod";

export const researchStatusEnum = z.enum([
  "IDEA",
  "VALIDATING",
  "READY_FOR_TEST",
  "DISCARDED",
  "CONVERTED",
]);

export type ResearchStatus = z.infer<typeof researchStatusEnum>;

export const researchItemSchema = z.object({
  market: z.string().min(1, "Market is required").default("Tunisia"),
  problem: z.string().min(3, "Problem description must be at least 3 characters"),
  target_customer: z.string().min(2, "Target customer is required"),
  pain_point: z.string().min(3, "Pain point is required"),
  promise: z.string().min(3, "Product promise is required"),
  competitors: z.string().optional().nullable(),
  estimated_cost: z.coerce.number().min(0, "Cost must be >= 0"),
  estimated_price: z.coerce.number().min(0, "Price must be >= 0"),
  creative_opportunities: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: researchStatusEnum.default("IDEA"),
});

export type ResearchItemInput = z.infer<typeof researchItemSchema>;
