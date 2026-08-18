import { z } from "zod";

export const assetTypeEnum = z.enum(["VIDEO", "IMAGE", "CAROUSEL"]);
export type AssetType = z.infer<typeof assetTypeEnum>;

export const aspectRatioEnum = z.enum(["9:16", "1:1", "4:5", "16:9"]);
export type AspectRatio = z.infer<typeof aspectRatioEnum>;

export const creativeLifecycleEnum = z.enum([
  "TESTING",
  "ACTIVE",
  "FATIGUED",
  "PAUSED",
  "ARCHIVED",
]);
export type CreativeLifecycleStatus = z.infer<typeof creativeLifecycleEnum>;

export const performanceTagEnum = z.enum(["WINNER", "KEEP", "ITERATE", "KILL"]);
export type PerformanceTag = z.infer<typeof performanceTagEnum>;

export const creativeAssetSchema = z.object({
  code: z.string().min(3, "Creative code must be at least 3 characters (e.g. CR-001)"),
  product_id: z.string().min(1, "Product is required"),
  angle_id: z.string().optional().nullable(),
  hook_id: z.string().optional().nullable(),
  asset_type: assetTypeEnum.default("VIDEO"),
  aspect_ratio: aspectRatioEnum.default("9:16"),
  creator_source: z.string().default("In-House"),
  media_url: z.string().optional().nullable(),
  thumbnail_url: z.string().optional().nullable(),
  primary_hook_text: z.string().optional().nullable(),
  lifecycle_status: creativeLifecycleEnum.default("TESTING"),
  performance_tag: performanceTagEnum.default("KEEP"),
  notes: z.string().optional().nullable(),
});

export type CreativeAssetInput = z.infer<typeof creativeAssetSchema>;
