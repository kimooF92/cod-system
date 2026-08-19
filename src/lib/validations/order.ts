import { z } from "zod";

export const TUNISIAN_GOVERNORATES = [
  "Ariana",
  "Béja",
  "Ben Arous",
  "Bizerte",
  "Gabès",
  "Gafsa",
  "Jendouba",
  "Kairouan",
  "Kasserine",
  "Kébili",
  "Le Kef",
  "Mahdia",
  "La Manouba",
  "Médenine",
  "Monastir",
  "Nabeul",
  "Sfax",
  "Sidi Bouzid",
  "Siliana",
  "Sousse",
  "Tataouine",
  "Tozeur",
  "Tunis",
  "Zaghouan",
] as const;

export type TunisianGovernorate = (typeof TUNISIAN_GOVERNORATES)[number];

export const orderStatusEnum = z.enum([
  "NEW_ORDER",
  "CONFIRMED",
  "DISPATCHED",
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
  "NO_ANSWER",
]);

export type OrderStatus = z.infer<typeof orderStatusEnum>;

/**
 * Sanitizes and normalizes any phone string to clean 8-digit Tunisian number
 * Examples: "+216 20 123 456" -> "20123456", "0021650111222" -> "50111222"
 */
export function sanitizeTunisianPhone(raw: string): string {
  if (!raw) return "";
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00216")) {
    digits = digits.slice(5);
  } else if (digits.startsWith("216")) {
    digits = digits.slice(3);
  }
  return digits;
}

/**
 * Validates Tunisian phone number format (must be 8 digits, starting with 2, 3, 4, 5, 7, 9)
 */
export function isValidTunisianPhone(phone: string): boolean {
  const sanitized = sanitizeTunisianPhone(phone);
  return /^[234579]\d{7}$/.test(sanitized);
}

export const orderInputSchema = z.object({
  customer_name: z.string().min(2, "Customer name must be at least 2 characters"),
  phone: z
    .string()
    .min(8, "Phone number is required")
    .refine((val) => isValidTunisianPhone(val), {
      message: "Please enter a valid 8-digit Tunisian phone number (e.g. 20123456)",
    }),
  governorate: z.enum(TUNISIAN_GOVERNORATES, {
    errorMap: () => ({ message: "Please select a valid Tunisian governorate" }),
  }),
  address: z.string().min(3, "Delivery address is required"),
  product_id: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(1),
  unit_price: z.coerce.number().min(1.0, "Unit price must be greater than 0"),
  delivery_fee: z.coerce.number().min(0, "Delivery fee cannot be negative").default(7.0),
  creative_id: z.string().optional().nullable(),
  source: z.string().default("Manual Intake"),
  notes: z.string().optional().nullable(),
});

export type OrderInput = z.infer<typeof orderInputSchema>;

export const COURIER_PRESETS = [
  "Aramex Tunisia",
  "First Delivery Express",
  "Maystro Delivery",
  "Quick Express",
  "Colis Express",
  "Other",
] as const;

export type CourierPreset = (typeof COURIER_PRESETS)[number];

export const RETURN_REASONS = [
  "Customer Refused on Delivery",
  "Unreachable / Wrong Phone",
  "Wrong Address / Incomplete",
  "Wrong Item Shipped",
  "Late Delivery / Cancelled by Customer",
  "Damaged in Transit",
  "Other",
] as const;

export type ReturnReason = (typeof RETURN_REASONS)[number];

export const reconcileOrderSchema = z.object({
  status: z.enum(["DISPATCHED", "DELIVERED", "RETURNED", "CANCELLED"]),
  courier_name: z.string().optional().nullable(),
  tracking_code: z.string().optional().nullable(),
  return_reason: z.string().optional().nullable(),
  return_fee: z.coerce.number().min(0, "Return fee cannot be negative").default(3.5),
  notes: z.string().optional().nullable(),
});

export type ReconcileOrderInput = z.infer<typeof reconcileOrderSchema>;

export const batchDispatchSchema = z.object({
  order_ids: z.array(z.string()).min(1, "At least one order must be selected"),
  courier_name: z.string().min(1, "Courier name is required"),
  notes: z.string().optional().nullable(),
});

export type BatchDispatchInput = z.infer<typeof batchDispatchSchema>;
