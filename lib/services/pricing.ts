import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/lib/models/Coupon";
import { Booking } from "@/lib/models/Booking";
import type { NightRate } from "./inventory";

export interface PriceBreakdown {
  nightlyRates: { date: Date; price: number }[];
  roomTotal: number;
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

/**
 * The single place a booking total is computed. Called when the hold is created
 * and again at payment, so a tampered form cannot change what is charged.
 */
export function priceBooking({
  nights,
  units,
  priceDelta,
  taxPct,
  serviceFee,
  commissionPct,
  discount = 0,
  couponCode = null,
  currency = "BDT",
}: {
  nights: NightRate[];
  units: number;
  priceDelta: number;
  taxPct: number;
  serviceFee: number;
  commissionPct: number;
  discount?: number;
  couponCode?: string | null;
  currency?: string;
}): PriceBreakdown {
  const nightlyRates = nights.map((n) => ({ date: n.date, price: n.price + priceDelta }));
  const roomTotal = nightlyRates.reduce((sum, n) => sum + n.price, 0) * units;
  const cappedDiscount = Math.min(Math.max(0, Math.round(discount)), roomTotal);
  const taxable = roomTotal - cappedDiscount;
  const taxes = Math.round(taxable * (taxPct / 100));
  const grandTotal = taxable + taxes + serviceFee;

  // Commission is taken on the whole booking value, and frozen onto the record.
  const commissionAmount = Math.round((grandTotal * commissionPct) / 100);

  return {
    nightlyRates,
    roomTotal,
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
