import { z } from "zod";
import { PROPERTY_TYPES } from "@/lib/models/types";

export const imageSchema = z.object({
  publicId: z.string().min(1),
  url: z.url(),
  width: z.coerce.number().int().positive().optional(),
  height: z.coerce.number().int().positive().optional(),
  alt: z.string().max(200).optional(),
});

/** Images arrive from the client as a JSON blob in a hidden field. */
export const imagesField = z
  .string()
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw || "[]");
    } catch {
      ctx.addIssue({ code: "custom", message: "Could not read the uploaded images." });
      return z.NEVER;
    }
  })
  .pipe(z.array(imageSchema).max(20, "Up to 20 images per property"));

/** Comma-separated chips from the UI. */
const csv = (max: number, label: string) =>
  z
    .string()
    .default("")
    .transform((v) =>
      v.split(",").map((s) => s.trim()).filter(Boolean).slice(0, max),
    )
    .pipe(z.array(z.string().max(60)).max(max, `Up to ${max} ${label}`));

export const hotelSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(120),
  description: z
    .string()
    .min(80, "Write at least 80 characters — this is what guests read first")
    .max(4000),
  propertyType: z.enum(PROPERTY_TYPES),
  starCategory: z.coerce.number().int().min(1).max(5),
  address: z.string().min(6, "Enter the full street address").max(240),
  city: z.string().min(2, "City is required").max(80),
  country: z.string().min(2).max(80).default("Bangladesh"),
  location: z.string().min(3, "Describe the area, e.g. 'Kolatoli Beach'").max(160),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal("").transform(() => undefined)),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal("").transform(() => undefined)),
  distanceFromCenter: z.coerce.number().min(0).max(200).optional(),
  amenities: csv(40, "amenities"),
  tags: csv(10, "tags"),
  images: imagesField,
  checkInTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  checkOutTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  cancellationHours: z.coerce.number().int().min(0).max(720),
  childrenAllowed: z.stringbool().default(false),
  petsAllowed: z.stringbool().default(false),
  extraNotes: z.string().max(1000).optional(),
});

export const ratePlanSchema = z.object({
  code: z.string().regex(/^[a-z0-9-]{2,30}$/, "Lowercase letters, numbers and dashes"),
  name: z.string().min(2).max(60),
  breakfast: z.boolean(),
  refundable: z.boolean(),
  priceDelta: z.number().int().min(-100000).max(100000),
  cancellationHours: z.number().int().min(0).max(720),
});

export const ratePlansField = z
  .string()
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw || "[]");
    } catch {
      ctx.addIssue({ code: "custom", message: "Could not read the rate plans." });
      return z.NEVER;
    }
  })
  .pipe(z.array(ratePlanSchema).min(1, "Add at least one rate plan").max(8));

export const roomSchema = z.object({
  name: z.string().min(2, "Room name is required").max(90),
  description: z.string().max(1200).default(""),
  bedType: z.string().min(2, "Describe the beds").max(60),
  sizeSqm: z.coerce.number().min(5).max(1000).optional(),
  maxAdults: z.coerce.number().int().min(1).max(20),
  maxChildren: z.coerce.number().int().min(0).max(20),
  basePrice: z.coerce.number().int().min(100, "Minimum ৳100 per night").max(1_000_000),
  totalUnits: z.coerce.number().int().min(1, "At least one room").max(500),
  amenities: csv(30, "amenities"),
  images: imagesField,
  ratePlans: ratePlansField,
});

export const inventoryBulkSchema = z
  .object({
    roomId: z.string().min(1),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a start date"),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick an end date"),
    weekdays: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((v) => {
        if (!v) return [0, 1, 2, 3, 4, 5, 6];
        const list = Array.isArray(v) ? v : [v];
        return list.map(Number).filter((n) => n >= 0 && n <= 6);
      }),
    price: z
      .string()
      .optional()
      .transform((v) => (v === "" || v == null ? null : Number(v)))
      .refine((v) => v === null || (v >= 100 && v <= 1_000_000), "Price must be ৳100 or more"),
    unitsTotal: z
      .string()
      .optional()
      .transform((v) => (v === "" || v == null ? null : Number(v)))
      .refine((v) => v === null || (v >= 0 && v <= 500), "Units must be between 0 and 500"),
    minStay: z
      .string()
      .optional()
      .transform((v) => (v === "" || v == null ? null : Number(v)))
      .refine((v) => v === null || (v >= 1 && v <= 30), "Minimum stay must be 1–30 nights"),
    closed: z.enum(["open", "closed", "unchanged"]).default("unchanged"),
  })
  .refine((d) => d.from <= d.to, { message: "End date must be after the start date", path: ["to"] })
  .refine(
    (d) => d.price !== null || d.unitsTotal !== null || d.minStay !== null || d.closed !== "unchanged",
    { message: "Change at least one field", path: ["price"] },
  );

export const vendorOnboardingSchema = z.object({
  businessName: z.string().min(3, "Business name is required").max(120),
  contactEmail: z.email("Enter a valid email"),
  contactPhone: z.string().min(6, "Enter a valid phone number").max(30),
  address: z.string().min(6, "Enter your business address").max(240),
  city: z.string().min(2, "City is required").max(80),
  tradeLicenceNo: z.string().max(60).optional(),
  tin: z.string().max(40).optional(),
  kycDocuments: z
    .string()
    .default("[]")
    .transform((raw, ctx) => {
      try {
        return JSON.parse(raw || "[]");
      } catch {
        ctx.addIssue({ code: "custom", message: "Could not read the uploaded documents." });
        return z.NEVER;
      }
    })
    .pipe(
      z.array(
        z.object({ label: z.string().max(80), publicId: z.string(), url: z.url() }),
      ).max(10),
    ),
});

export const bankDetailsSchema = z.object({
  accountName: z.string().min(2, "Account name is required").max(120),
  accountNumber: z.string().min(6, "Enter the full account number").max(40),
  bankName: z.string().min(2, "Bank name is required").max(120),
  branch: z.string().min(2, "Branch is required").max(120),
  routingNumber: z.string().max(30).optional(),
});

export type HotelInput = z.infer<typeof hotelSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
