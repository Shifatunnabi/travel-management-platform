import { z } from "zod";
import { PLATFORM_ROLES, RATING_ADJUSTMENT_MODES } from "@/lib/models/types";

export const vendorDecisionSchema = z.object({
  vendorId: z.string().min(1),
  decision: z.enum(["approve", "reject", "suspend", "reinstate"]),
  note: z.string().max(600).optional(),
  commissionPct: z
    .string()
    .optional()
    .transform((v) => (v === "" || v == null ? null : Number(v)))
    .refine((v) => v === null || (v >= 0 && v <= 100), "Commission must be between 0 and 100"),
});

export const hotelModerationSchema = z.object({
  hotelId: z.string().min(1),
  decision: z.enum(["approve", "reject", "suspend"]),
  note: z.string().max(600).optional(),
});

/**
 * The rating adjustment. A reason is mandatory for anything other than
 * clearing the adjustment, and the offset is clamped by platform settings.
 */
export const ratingAdjustmentSchema = z
  .object({
    hotelId: z.string().min(1),
    mode: z.enum(RATING_ADJUSTMENT_MODES),
    value: z.coerce.number().min(-5).max(5).default(0),
    seedCount: z.coerce.number().int().min(0).max(100_000).default(0),
    reason: z.string().max(300).default(""),
  })
  .refine((d) => d.mode === "none" || d.reason.trim().length >= 5, {
    message: "Give a reason — this is recorded in the audit log",
    path: ["reason"],
  })
  .refine((d) => d.mode !== "override" || (d.value >= 1 && d.value <= 5), {
    message: "An override must be between 1.0 and 5.0",
    path: ["value"],
  });

export const reviewModerationSchema = z.object({
  reviewId: z.string().min(1),
  decision: z.enum(["publish", "reject", "hide"]),
  reason: z.string().max(300).optional(),
});

export const settingsSchema = z.object({
  defaultCommissionPct: z.coerce.number().min(0).max(100),
  taxPct: z.coerce.number().min(0).max(100),
  serviceFee: z.coerce.number().min(0).max(100_000),
  settlementDays: z.coerce.number().int().min(0).max(90),
  holdMinutes: z.coerce.number().int().min(1).max(240),
  maxRatingOffset: z.coerce.number().min(0).max(5),
  minPayoutAmount: z.coerce.number().min(0).max(1_000_000),
  supportEmail: z.email(),
  supportPhone: z.string().min(5).max(40),
});

export const staffSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  platformRole: z.enum(PLATFORM_ROLES),
  password: z.string().min(8, "Use at least 8 characters"),
});

export const payoutDecisionSchema = z.object({
  payoutId: z.string().min(1),
  decision: z.enum(["approve", "reject", "mark_paid"]),
  approvedAmount: z
    .string()
    .optional()
    .transform((v) => (v === "" || v == null ? null : Number(v)))
    .refine((v) => v === null || v > 0, "Enter a positive amount"),
  reference: z.string().max(120).optional(),
  reason: z.string().max(400).optional(),
});

export const couponSchema = z
  .object({
    code: z.string().regex(/^[A-Z0-9]{4,20}$/, "4–20 letters and numbers, uppercase"),
    description: z.string().max(200).optional(),
    type: z.enum(["percent", "fixed"]),
    value: z.coerce.number().min(1),
    maxDiscount: z
      .string()
      .optional()
      .transform((v) => (v === "" || v == null ? null : Number(v))),
    minSpend: z.coerce.number().min(0).default(0),
    usageLimit: z
      .string()
      .optional()
      .transform((v) => (v === "" || v == null ? null : Number(v))),
    perUserLimit: z.coerce.number().int().min(1).max(50).default(1),
    validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a start date"),
    validTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick an end date"),
  })
  .refine((d) => d.validFrom <= d.validTo, {
    message: "The end date must be after the start date",
    path: ["validTo"],
  })
  .refine((d) => d.type !== "percent" || d.value <= 100, {
    message: "A percentage cannot exceed 100",
    path: ["value"],
  });
