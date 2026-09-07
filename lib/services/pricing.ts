import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/lib/models/Coupon";
import { Booking } from "@/lib/models/Booking";
import type { IRoomOption } from "@/lib/models/Room";

export interface SelectedOption {
  code: string;
  label: string;
  price: number;
  per: "night" | "stay";
  /** What this extra added to the booking, once nights and rooms are counted. */
  amount: number;
}

export interface PriceBreakdown {
  nightlyRates: { date: Date; price: number }[];
  roomTotal: number;
  options: SelectedOption[];
  extrasTotal: number;
  subtotal: number;
  taxes: number;
  serviceFee: number;
  discount: number;
  couponCode: string | null;
  grandTotal: number;
  currency: string;
  commissionPct: number;
  commissionAmount: number;
  vendorEarning: number;
}

export interface PriceInput {
  /** The room's own rate for each night, for one room, before occupancy. */
  nights: { date: Date; price: number }[];
  /** How many rooms of this type. */
  units: number;
  /**
   * Multiplier on the nightly rate. Always 1 for a room sold per room — which
   * is the default — and the guest count only when the vendor charges per head.
   */
  occupancy?: number;
  /** Extras the guest ticked. Additive on top of the room, never instead of it. */
  options?: Pick<IRoomOption, "code" | "label" | "price" | "per">[];
  taxPct: number;
  serviceFee: number;
  commissionPct: number;
  discount?: number;
  couponCode?: string | null;
  currency?: string;
}

/**
 * The single place a booking total is computed. Called when the hold is created
 * and again at payment, so a tampered form cannot change what is charged.
 *
 * The shape is deliberately flat: one room rate, multiplied by nights, rooms and
 * — only if the vendor asked for it — guests, then the chosen extras added on.
 */
export function priceBooking({
  nights,
  units,
  occupancy = 1,
  options = [],
  taxPct,
  serviceFee,
  commissionPct,
  discount = 0,
  couponCode = null,
  currency = "BDT",
}: PriceInput): PriceBreakdown {
  const nightCount = nights.length;
  const nightlyRates = nights.map((n) => ({ date: n.date, price: n.price * occupancy }));
  const roomTotal = nightlyRates.reduce((sum, n) => sum + n.price, 0) * units;

  const selected: SelectedOption[] = options.map((o) => ({
    code: o.code,
    label: o.label,
    price: o.price,
    per: o.per,
    amount: o.price * (o.per === "night" ? nightCount : 1) * units,
  }));
  const extrasTotal = selected.reduce((sum, o) => sum + o.amount, 0);

  const subtotal = roomTotal + extrasTotal;
  const cappedDiscount = Math.min(Math.max(0, Math.round(discount)), subtotal);
  const taxable = subtotal - cappedDiscount;
  const taxes = Math.round(taxable * (taxPct / 100));
  const grandTotal = taxable + taxes + serviceFee;

  // Commission is taken on the whole booking value, and frozen onto the record.
  const commissionAmount = Math.round((grandTotal * commissionPct) / 100);

  return {
    nightlyRates,
    roomTotal,
    options: selected,
    extrasTotal,
    subtotal,
    taxes,
    serviceFee,
    discount: cappedDiscount,
    couponCode: cappedDiscount > 0 ? couponCode : null,
    grandTotal,
    currency,
    commissionPct,
    commissionAmount,
    vendorEarning: grandTotal - commissionAmount,
  };
}

export interface CouponCheck {
  ok: boolean;
  discount: number;
  message: string;
  code?: string;
}

/** Validates a coupon against scope, spend, window and usage — all server-side. */
export async function evaluateCoupon(
  rawCode: string,
  context: { roomTotal: number; hotelId: string; vendorId: string; city: string; customerId?: string },
): Promise<CouponCheck> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, discount: 0, message: "Enter a code." };

  await connectDB();
  const coupon = await Coupon.findOne({ code, status: "active" }).lean();
  if (!coupon) return { ok: false, discount: 0, message: "That code is not valid." };

  const now = new Date();
  if (now < coupon.validFrom) return { ok: false, discount: 0, message: "That code is not active yet." };
  if (now > coupon.validTo) return { ok: false, discount: 0, message: "That code has expired." };

  if (coupon.scope === "vendor" && String(coupon.vendorId) !== context.vendorId) {
    return { ok: false, discount: 0, message: "That code does not apply to this property." };
  }
  if (coupon.appliesTo.hotelIds.length && !coupon.appliesTo.hotelIds.some((h) => String(h) === context.hotelId)) {
    return { ok: false, discount: 0, message: "That code does not apply to this property." };
  }
  if (coupon.appliesTo.cities.length && !coupon.appliesTo.cities.some((c) => c.toLowerCase() === context.city.toLowerCase())) {
    return { ok: false, discount: 0, message: "That code does not apply in this city." };
  }
  if (context.roomTotal < coupon.minSpend) {
    return {
      ok: false,
      discount: 0,
      message: `This code needs a minimum spend of ৳${coupon.minSpend.toLocaleString("en-BD")}.`,
    };
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, discount: 0, message: "That code has been fully redeemed." };
  }
  if (context.customerId) {
    const used = await Booking.countDocuments({
      customerId: context.customerId,
      "pricing.couponCode": code,
      status: { $nin: ["cancelled", "expired"] },
    });
    if (used >= coupon.perUserLimit) {
      return { ok: false, discount: 0, message: "You have already used this code." };
    }
  }

  let discount =
    coupon.type === "percent"
      ? Math.round((context.roomTotal * coupon.value) / 100)
      : coupon.value;
  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, context.roomTotal);

  return {
    ok: true,
    discount,
    code,
    message: `৳${discount.toLocaleString("en-BD")} off applied.`,
  };
}
