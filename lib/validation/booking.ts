import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date");

/** Extras arrive as a comma-separated list in the URL, or repeated in a form. */
const optionCodes = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => {
    if (!v) return [] as string[];
    const list = Array.isArray(v) ? v : v.split(",");
    return [...new Set(list.map((c) => c.trim()).filter(Boolean))].slice(0, 12);
  });

export const startBookingSchema = z
  .object({
    roomId: z.string().min(1, "Choose a room"),
    options: optionCodes,
    checkIn: isoDate,
    checkOut: isoDate,
    guests: z.coerce.number().int().min(1).max(30).default(2),
    rooms: z.coerce.number().int().min(1).max(10).default(1),
  })
  .refine((d) => d.checkOut > d.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

export const guestDetailsSchema = z.object({
  ref: z.string().min(1),
  fullName: z.string().min(2, "Enter the lead guest's full name").max(120),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .min(6, "Enter a valid phone number")
    .regex(/^[+0-9\s-()]+$/, "Enter a valid phone number"),
  specialRequests: z.string().max(500).optional(),
});

export const couponSchema = z.object({
  ref: z.string().min(1),
  code: z.string().min(1, "Enter a code").max(30),
});

export const cancelBookingSchema = z.object({
  ref: z.string().min(1),
  reason: z.string().min(3, "Tell us why — it helps the property").max(400),
});

export const reviewSchema = z.object({
  ref: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Pick a rating").max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(20, "Write at least 20 characters").max(2000),
  tripType: z.string().max(40).optional(),
});

export const vendorReplySchema = z.object({
  reviewId: z.string().min(1),
  body: z.string().min(10, "Write at least 10 characters").max(1000),
});

export const bookingStatusSchema = z.object({
  ref: z.string().min(1),
  action: z.enum(["check_in", "check_out", "no_show", "cancel"]),
  reason: z.string().max(400).optional(),
});
