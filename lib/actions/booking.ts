"use server";

import { redirect } from "next/navigation";
import { updateTag, revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { getSessionUser, requireUser } from "@/lib/auth/guards";
import { Booking, type IBookingPricing } from "@/lib/models/Booking";
import { Payment } from "@/lib/models/Payment";
import { readSettings } from "@/lib/services/settings";
import { evaluateCoupon, priceBooking } from "@/lib/services/pricing";
import { BookingError, cancelBooking, startBooking } from "@/lib/services/booking-flow";
import { InventoryConflictError } from "@/lib/services/inventory";
import { createSession, makeTranId } from "@/lib/services/sslcommerz";
import { isPaymentConfigured } from "@/lib/env";
import { audit } from "@/lib/services/audit";
import {
  cancelBookingSchema, couponSchema, guestDetailsSchema, startBookingSchema,
} from "@/lib/validation/booking";
import { fail, parseForm, succeed, type ActionState } from "./_result";

/** Creates the hold and sends the guest into the checkout flow. */
export async function startBookingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseForm(startBookingSchema, formData);
  if (!parsed.ok) return parsed.state;

  const user = await getSessionUser();
  const d = parsed.data;

  let ref: string;
  try {
    ref = await startBooking({
      roomId: d.roomId,
      optionCodes: d.options,
      checkIn: d.checkIn,
      checkOut: d.checkOut,
      units: d.rooms,
      adults: d.guests,
      children: 0,
      customerId: user?.id,
    });
  } catch (error) {
    if (error instanceof InventoryConflictError || error instanceof BookingError) {
      return fail(error.message);
    }
    console.error("[booking] start failed:", error);
    return fail("Could not hold that room. Try again.");
  }

  redirect(`/book/hotel/${ref}/guests`);
}

/** Loads a booking that the caller is allowed to see. */
async function ownBooking(ref: string) {
  await connectDB();
  const booking = await Booking.findOne({ ref: ref.toUpperCase() });
  if (!booking) return null;

  const user = await getSessionUser();
  // A booking made before signing in has no customer yet; the reference itself
  // is the only credential at that point, which is why it is unguessable.
  if (booking.customerId && user?.id !== String(booking.customerId)) {
    if (user?.role !== "platform") return null;
  }
  return booking;
}

export async function saveGuestDetailsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseForm(guestDetailsSchema, formData);
  if (!parsed.ok) return parsed.state;

  const booking = await ownBooking(parsed.data.ref);
  if (!booking) return fail("We could not find that booking.");
  if (booking.status !== "pending_payment") return fail("This booking is no longer being edited.");
  if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
    return fail("Your room hold expired. Start again to check current availability.");
  }

  const user = await getSessionUser();
  booking.guestDetails = {
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    specialRequests: parsed.data.specialRequests,
  };
  // Claim a guest-started booking once the person signs in.
  if (!booking.customerId && user?.id) booking.customerId = user.id as never;
  await booking.save();

  redirect(`/book/hotel/${booking.ref}/review`);
}

/**
 * Recomputes a booking's totals from what is already stored on it — the frozen
 * nightly rates and the extras that were chosen. Nothing is read back from the
 * room, so a later price change cannot rewrite a held booking, and nothing is
 * read from the client, so a tampered form cannot either.
 */
function reprice(
  booking: { pricing: IBookingPricing; units: number },
  settings: { taxPct: number; serviceFee: number },
  discount: number,
  couponCode: string | null,
) {
  return priceBooking({
    nights: booking.pricing.nightlyRates.map((n) => ({ date: n.date, price: n.price })),
    units: booking.units,
    options: booking.pricing.options ?? [],
    taxPct: settings.taxPct,
    serviceFee: settings.serviceFee,
    commissionPct: booking.pricing.commissionPct,
    discount,
    couponCode,
    currency: booking.pricing.currency,
  });
}

export async function applyCouponAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseForm(couponSchema, formData);
  if (!parsed.ok) return parsed.state;

  const booking = await ownBooking(parsed.data.ref);
  if (!booking) return fail("We could not find that booking.");
  if (booking.status !== "pending_payment") return fail("This booking can no longer be changed.");

  const settings = await readSettings();
  const result = await evaluateCoupon(parsed.data.code, {
    roomTotal: booking.pricing.subtotal || booking.pricing.roomTotal,
    hotelId: String(booking.hotelId),
    vendorId: String(booking.vendorId),
    city: booking.snapshot.hotelCity,
    customerId: booking.customerId ? String(booking.customerId) : undefined,
  });

  if (!result.ok) return fail(result.message);

  booking.pricing = reprice(booking, settings, result.discount, result.code ?? null);
  await booking.save();

  revalidatePath(`/book/hotel/${booking.ref}/review`);
  return succeed(result.message);
}

export async function removeCouponAction(ref: string): Promise<ActionState> {
  const booking = await ownBooking(ref);
  if (!booking) return fail("We could not find that booking.");
  if (booking.status !== "pending_payment") return fail("This booking can no longer be changed.");

  const settings = await readSettings();

  booking.pricing = reprice(booking, settings, 0, null);
  await booking.save();

  revalidatePath(`/book/hotel/${booking.ref}/review`);
  return succeed("Coupon removed.");
}

/**
 * Opens a gateway session and hands back the URL to redirect to. The amount is
 * taken from the stored booking, never from the form.
 */
type PayState = ActionState<{ gatewayUrl: string }>;

export async function payBookingAction(
  _prev: PayState,
  formData: FormData,
): Promise<PayState> {
  const ref = String(formData.get("ref") ?? "");
  const booking = await ownBooking(ref);
  if (!booking) return fail("We could not find that booking.");
  if (booking.status !== "pending_payment") return fail("This booking has already been paid.");
  if (!booking.guestDetails.email) return fail("Add the guest details first.");
  if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
    return fail("Your room hold expired. Start again to check current availability.");
  }
  if (!isPaymentConfigured()) {
    return fail(
      "Card payment is not switched on yet. Your room is held — contact support to complete this booking.",
    );
  }

  const tranId = makeTranId(booking.ref);
  const payment = await Payment.create({
    bookingId: booking._id,
    tranId,
    amount: booking.pricing.grandTotal,
    currency: booking.pricing.currency,
    status: "initiated",
  });

  const session = await createSession({
    tranId,
    amount: booking.pricing.grandTotal,
    currency: booking.pricing.currency,
    bookingRef: booking.ref,
    customerName: booking.guestDetails.fullName,
    customerEmail: booking.guestDetails.email,
    customerPhone: booking.guestDetails.phone,
    productName: `${booking.snapshot.hotelName} — ${booking.snapshot.roomName}`,
    stay: {
      hotelName: booking.snapshot.hotelName,
      hotelCity: booking.snapshot.hotelCity,
      lengthOfStay: booking.nights,
      checkInTime: booking.checkIn.toISOString().slice(0, 10),
    },
  });

  if (!session.ok || !session.gatewayUrl) {
    payment.status = "failed";
    payment.failureReason = session.error;
    await payment.save();
    return fail(session.error ?? "Could not start the payment.");
  }

  booking.paymentId = payment._id as never;
  await booking.save();

  return succeed(undefined, { gatewayUrl: session.gatewayUrl });
}

export async function cancelBookingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseForm(cancelBookingSchema, formData);
  if (!parsed.ok) return parsed.state;

  const user = await requireUser();
  const booking = await ownBooking(parsed.data.ref);
  if (!booking) return fail("We could not find that booking.");

  try {
    const result = await cancelBooking(
      String(booking._id),
      { id: user.id, role: "customer" },
      parsed.data.reason,
    );
    await audit({
      actor: user, action: "booking.cancel", entity: "Booking",
      entityId: String(booking._id), reason: parsed.data.reason,
      after: { refundAmount: result.refundAmount },
    });

    updateTag(`bookings-${user.id}`);
    revalidatePath("/account/bookings");
    return succeed(
      result.refundAmount > 0
        ? `Cancelled. ৳${result.refundAmount.toLocaleString("en-BD")} will be returned to your payment method within 5–10 working days.`
        : "Cancelled. This rate was outside its free-cancellation window, so no refund is due.",
    );
  } catch (error) {
    if (error instanceof BookingError) return fail(error.message);
    console.error("[booking] cancel failed:", error);
    return fail("Could not cancel that booking.");
  }
}
