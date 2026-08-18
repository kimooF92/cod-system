import { z } from "zod";

export const adPlatformEnum = z.enum([
  "META_ADS",
  "TIKTOK_ADS",
  "SNAPCHAT_ADS",
  "GOOGLE_ADS",
]);
export type AdPlatform = z.infer<typeof adPlatformEnum>;

export const campaignObjectiveEnum = z.enum([
  "TESTING",
  "SCALING",
  "RETARGETING",
  "WARMUP",
]);
export type CampaignObjective = z.infer<typeof campaignObjectiveEnum>;

export const campaignStatusEnum = z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]);
export type CampaignStatus = z.infer<typeof campaignStatusEnum>;

export const adCampaignSchema = z.object({
  name: z.string().min(2, "Campaign name must be at least 2 characters"),
  platform: adPlatformEnum.default("META_ADS"),
  objective: campaignObjectiveEnum.default("TESTING"),
  daily_budget: z.coerce.number().min(5.0, "Daily budget must be at least 5.000 DT"),
  status: campaignStatusEnum.default("ACTIVE"),
});
export type AdCampaignInput = z.infer<typeof adCampaignSchema>;

export const adSetSchema = z.object({
  campaign_id: z.string().min(1, "Campaign is required"),
  name: z.string().min(2, "Ad set name must be at least 2 characters"),
  audience_targeting: z.string().default("Broad Tunisia 22-55"),
  daily_budget: z.coerce.number().optional().nullable(),
  status: campaignStatusEnum.default("ACTIVE"),
});
export type AdSetInput = z.infer<typeof adSetSchema>;

export const adSchema = z.object({
  ad_set_id: z.string().min(1, "Ad Set is required"),
  name: z.string().min(2, "Ad name must be at least 2 characters"),
  product_id: z.string().min(1, "Product is required"),
  creative_id: z.string().min(1, "Creative asset is required"),
  status: campaignStatusEnum.default("ACTIVE"),
});
export type AdInput = z.infer<typeof adSchema>;
