/** Shared domain enums. Kept in one file so models, Zod schemas, and UI agree. */

export const USER_ROLES = ["customer", "vendor", "platform"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const VENDOR_MEMBER_ROLES = ["owner", "manager", "staff"] as const;
export type VendorMemberRole = (typeof VENDOR_MEMBER_ROLES)[number];

export const PLATFORM_ROLES = ["super_admin", "ops", "finance", "support"] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const VENDOR_STATUSES = ["pending", "approved", "rejected", "suspended"] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

export const HOTEL_STATUSES = [
  "draft",
  "pending_review",
  "published",
  "rejected",
  "suspended",
] as const;
export type HotelStatus = (typeof HOTEL_STATUSES)[number];

export const BOOKING_STATUSES = [
  "pending_payment",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "expired",
  "no_show",
  "refunded",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "initiated",
  "success",
  "failed",
  "cancelled",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const REVIEW_STATUSES = ["pending", "published", "rejected", "hidden"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const PAYOUT_STATUSES = [
  "requested",
  "under_review",
  "approved",
  "paid",
  "rejected",
] as const;
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

export const LEDGER_TYPES = [
  "earning",
  "commission",
  "refund",
  "commission_reversal",
  "adjustment",
  "payout",
] as const;
export type LedgerType = (typeof LEDGER_TYPES)[number];

export const RATING_ADJUSTMENT_MODES = ["none", "offset", "override"] as const;
export type RatingAdjustmentMode = (typeof RATING_ADJUSTMENT_MODES)[number];

export const PROPERTY_TYPES = [
  "hotel",
  "resort",
  "guest_house",
  "apartment",
  "villa",
  "hostel",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const COUPON_SCOPES = ["platform", "vendor"] as const;
export type CouponScope = (typeof COUPON_SCOPES)[number];
