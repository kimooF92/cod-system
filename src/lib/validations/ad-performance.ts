import { z } from "zod";

export const adPerformanceDailySchema = z.object({
  ad_id: z.string().optional().nullable(),
  campaign_id: z.string().optional().nullable(),
  creative_id: z.string().optional().nullable(),
  product_id: z.string().min(1, "Product is required"),
  date: z.string().default(() => new Date().toISOString().split("T")[0]),
  spend: z.coerce.number().min(0, "Spend cannot be negative"),
  impressions: z.coerce.number().int().min(0, "Impressions cannot be negative").default(0),
  clicks: z.coerce.number().int().min(0, "Clicks cannot be negative").default(0),
  leads: z.coerce.number().int().min(0, "Leads cannot be negative").default(0),
  notes: z.string().optional().nullable(),
});

export type AdPerformanceDailyInput = z.infer<typeof adPerformanceDailySchema>;
