import { z } from "zod";

export const hookTypeEnum = z.enum([
  "QUESTION",
  "BOLD_CLAIM",
  "PROBLEM_AGITATION",
  "CURIOSITY_GAP",
  "SOCIAL_PROOF",
  "OFFER_LED",
  "DEMONSTRATION",
]);

export type HookType = z.infer<typeof hookTypeEnum>;

export const HOOK_TYPE_LABELS: Record<HookType, { label: string; description: string }> = {
  QUESTION: { label: "Question", description: "Direct question engaging immediate audience curiosity" },
  BOLD_CLAIM: { label: "Bold Claim", description: "Strong polarizing statement challenging common beliefs" },
  PROBLEM_AGITATION: { label: "Problem Agitation", description: "Highlights deep visceral pain point" },
  CURIOSITY_GAP: { label: "Curiosity Gap", description: "Unfinished narrative hook creating curiosity" },
  SOCIAL_PROOF: { label: "Social Proof", description: "Customer review / 'Everyone in Tunisia is using this'" },
  OFFER_LED: { label: "Offer / Discount", description: "Direct promotion, bundle deal or free delivery callout" },
  DEMONSTRATION: { label: "Demonstration", description: "Visual proof / extreme stress test in first 3 seconds" },
};

export const creativeFormatEnum = z.enum([
  "PROBLEM_SOLUTION",
  "DEMONSTRATION",
  "UGC_TESTIMONIAL",
  "UNBOXING",
  "COMPARISON",
  "OFFER_LED",
  "AUTHORITY_REVIEW",
]);

export type CreativeFormat = z.infer<typeof creativeFormatEnum>;

export const CREATIVE_FORMAT_LABELS: Record<CreativeFormat, { label: string; description: string }> = {
  PROBLEM_SOLUTION: { label: "Problem-Solution", description: "Shows struggle then instant relief" },
  DEMONSTRATION: { label: "Visual Demo", description: "Shows features and durability in action" },
  UGC_TESTIMONIAL: { label: "UGC Testimonial", description: "Selfie-style authentic user endorsement" },
  UNBOXING: { label: "Unboxing & Packaging", description: "Premium unboxing experience and first impressions" },
  COMPARISON: { label: "Vs Alternatives", description: "Side-by-side comparison with cheaper low-quality competitors" },
  OFFER_LED: { label: "Offer-Led / Bundle", description: "Focus on Buy 1 Get 1 or limited seasonal stock" },
  AUTHORITY_REVIEW: { label: "Authority / Expert", description: "Expert explanation or technician recommendation" },
};

export const marketingAngleSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  name: z.string().min(2, "Angle name must be at least 2 characters"),
  pain_point: z.string().min(3, "Pain point is required"),
  promise: z.string().min(3, "Promise is required"),
  target_customer_avatar: z.string().default("General Consumer"),
  creative_format: creativeFormatEnum.default("PROBLEM_SOLUTION"),
  notes: z.string().optional().nullable(),
});

export type MarketingAngleInput = z.infer<typeof marketingAngleSchema>;

export const marketingHookSchema = z.object({
  angle_id: z.string().min(1, "Angle is required"),
  hook_text: z.string().min(3, "Hook copy must be at least 3 characters"),
  hook_type: hookTypeEnum.default("PROBLEM_AGITATION"),
  notes: z.string().optional().nullable(),
});

export type MarketingHookInput = z.infer<typeof marketingHookSchema>;
