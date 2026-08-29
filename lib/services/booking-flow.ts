import type { ClientSession } from "mongoose";
import { connectDB, withTransaction } from "@/lib/db/connect";
import { Booking, generateBookingRef, type IBooking } from "@/lib/models/Booking";
import { Hotel } from "@/lib/models/Hotel";
import { Room } from "@/lib/models/Room";
import { Vendor } from "@/lib/models/Vendor";
import { Coupon } from "@/lib/models/Coupon";
import { LedgerEntry } from "@/lib/models/Ledger";
import { readSettings } from "./settings";
import { priceBooking } from "./pricing";
import {
  checkAvailability, commitHold, countNights, holdUnits,
  InventoryConflictError, releaseBooked, releaseHold, toNight,
} from "./inventory";
import { sendMail } from "./mailer";
import { bookingConfirmedTemplate, bookingCancelledTemplate, vendorNewBookingTemplate } from "./email-templates";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";

export class BookingError extends Error {}

export interface StartBookingInput {
  roomId: string;
  ratePlanCode: string;
  checkIn: string;
  checkOut: string;
  units: number;
  adults: number;
  children: number;
  customerId?: string;
}

/**
 * Creates the booking and holds inventory in one transaction. If anything in
 * here fails — including another checkout taking the last room a millisecond
 * earlier — nothing is written at all.
 */
export async function startBooking(input: StartBookingInput): Promise<string> {
  await connectDB();
  const settings = await readSettings();

  const room = await Room.findOne({ _id: input.roomId, status: "active" }).lean();
  if (!room) throw new BookingError("That room is no longer on sale.");

  const hotel = await Hotel.findOne({ _id: room.hotelId, status: "published" }).lean();
  if (!hotel) throw new BookingError("That property is not accepting bookings.");

  const plan = room.ratePlans.find((p) => p.code === input.ratePlanCode);
  if (!plan) throw new BookingError("That rate plan is no longer offered.");

  const checkIn = toNight(input.checkIn);
  const checkOut = toNight(input.checkOut);
  const nights = countNights(checkIn, checkOut);
  if (nights < 1) throw new BookingError("Choose at least one night.");
  if (nights > 30) throw new BookingError("Stays are limited to 30 nights.");

  const capacity = (room.maxAdults + room.maxChildren) * input.units;
  if (input.adults + input.children > capacity) {
    throw new BookingError(
      `This room sleeps ${room.maxAdults} adults${room.maxChildren ? ` and ${room.maxChildren} children` : ""} — add another room.`,
    );
  }

  const availability = await checkAvailability(room, checkIn, checkOut, input.units);
  if (!availability.available) throw new BookingError(availability.reason ?? "Those dates are not available.");

  const vendor = await Vendor.findById(hotel.vendorId).select("commissionPct status").lean();
  if (!vendor || vendor.status !== "approved") {
    throw new BookingError("That property is not accepting bookings.");
  }

  const pricing = priceBooking({
    nights: availability.nights,
    units: input.units,
    priceDelta: plan.priceDelta,
    taxPct: settings.taxPct,
    serviceFee: settings.serviceFee,
    commissionPct: vendor.commissionPct ?? settings.defaultCommissionPct,
    currency: settings.currency,
  });

  const ref = await uniqueRef();
  const holdExpiresAt = new Date(Date.now() + settings.holdMinutes * 60_000);

  await withTransaction(async (session) => {
    await holdUnits(String(room._id), String(hotel._id), checkIn, checkOut, input.units, session);

    await Booking.create(
      [
        {
          ref,
          customerId: input.customerId ?? null,
          hotelId: hotel._id,
          vendorId: hotel.vendorId,
          roomId: room._id,
          ratePlanCode: plan.code,
          snapshot: {
            hotelName: hotel.name,
            hotelSlug: hotel.slug,
            hotelCity: hotel.city,
            hotelAddress: hotel.address,
            hotelImage: hotel.images[0]?.url,
            roomName: room.name,
            ratePlanName: plan.name,
            breakfast: plan.breakfast,
            refundable: plan.refundable,
            cancellationHours: plan.cancellationHours,
          },
          checkIn,
          checkOut,
          nights,
          units: input.units,
          guests: { adults: input.adults, children: input.children },
          pricing,
          status: "pending_payment",
          holdExpiresAt,
          timeline: [{ status: "pending_payment", at: new Date() }],
        },
      ],
      { session, ordered: true },
    );
  });

  return ref;
}

async function uniqueRef(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const ref = generateBookingRef();
    const exists = await Booking.exists({ ref });
    if (!exists) return ref;
  }
  throw new BookingError("Could not allocate a booking reference. Try again.");
}

/**
 * Turns a paid, gateway-validated booking into a confirmed one. Idempotent —
 * the IPN and the browser redirect can both land, in either order, and the
 * second call is a no-op.
 */
export async function confirmBooking(
  bookingId: string,
  paymentId: string,
): Promise<{ confirmed: boolean; alreadyDone: boolean }> {
  await connectDB();
  const settings = await readSettings();

  const outcome = await withTransaction(async (session) => {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) throw new BookingError("Booking not found.");

    if (booking.status !== "pending_payment") {
      return { confirmed: booking.status === "confirmed", alreadyDone: true };
    }

    await commitHold(String(booking.roomId), booking.checkIn, booking.checkOut, booking.units, session);

    booking.status = "confirmed";
    booking.paymentId = paymentId as never;
    booking.holdExpiresAt = null;
    booking.timeline.push({ status: "confirmed", at: new Date() });
    await booking.save({ session });

    // Earnings become withdrawable a settlement window after check-out.
    const availableAt = new Date(booking.checkOut);
    availableAt.setUTCDate(availableAt.getUTCDate() + settings.settlementDays);

    await LedgerEntry.create(
      [
        {
          vendorId: booking.vendorId,
          bookingId: booking._id,
          type: "earning",
          amount: booking.pricing.vendorEarning,
          currency: booking.pricing.currency,
          availableAt,
          note: `Booking ${booking.ref}`,
        },
        {
          vendorId: booking.vendorId,
          bookingId: booking._id,
          type: "commission",
          amount: -booking.pricing.commissionAmount,
          currency: booking.pricing.currency,
          availableAt,
          note: `Platform commission ${booking.pricing.commissionPct}%`,
        },
      ],
      { session, ordered: true },
    );

    if (booking.pricing.couponCode) {
      await Coupon.updateOne(
        { code: booking.pricing.couponCode },
        { $inc: { usedCount: 1 } },
        { session },
      );
    }

    return { confirmed: true, alreadyDone: false };
  });

  if (outcome.confirmed && !outcome.alreadyDone) {
    void sendConfirmationEmails(bookingId);
  }
  return outcome;
}

async function sendConfirmationEmails(bookingId: string): Promise<void> {
  const booking = await Booking.findById(bookingId).lean();
  if (!booking) return;

  const data = {
    ref: booking.ref,
    guestName: booking.guestDetails.fullName || "Guest",
    hotelName: booking.snapshot.hotelName,
    hotelAddress: booking.snapshot.hotelAddress,
    roomName: booking.snapshot.roomName,
    ratePlanName: booking.snapshot.ratePlanName,
    checkIn: formatDate(booking.checkIn.toISOString()),
    checkOut: formatDate(booking.checkOut.toISOString()),
    nights: booking.nights,
    guests: `${booking.guests.adults} adults${booking.guests.children ? `, ${booking.guests.children} children` : ""}`,
    total: formatCurrency(booking.pricing.grandTotal, booking.pricing.currency),
  };

  if (booking.guestDetails.email) {
    const mail = bookingConfirmedTemplate(data);
    await sendMail({
      to: booking.guestDetails.email,
      subject: mail.subject,
      html: mail.html,
      template: "booking-confirmed",
      relatedTo: { entity: "Booking", id: String(booking._id) },
    });
  }

  const vendor = await Vendor.findById(booking.vendorId).select("contactEmail").lean();
  if (vendor?.contactEmail) {
    const mail = vendorNewBookingTemplate(data);
    await sendMail({
      to: vendor.contactEmail,
      subject: mail.subject,
      html: mail.html,
      template: "vendor-new-booking",
      relatedTo: { entity: "Booking", id: String(booking._id) },
    });
  }
}

/** Marks a payment attempt failed and gives the held rooms back immediately. */
export async function failBooking(bookingId: string, reason: string): Promise<void> {
  await connectDB();
  const booking = await Booking.findById(bookingId);
  if (!booking || booking.status !== "pending_payment") return;

  await releaseHold(String(booking.roomId), booking.checkIn, booking.checkOut, booking.units);
  booking.status = "cancelled";
  booking.holdExpiresAt = null;
  booking.cancellation = {
    by: null,
    byRole: "system",
    reason,
    at: new Date(),
    refundAmount: 0,
  };
  booking.timeline.push({ status: "cancelled", at: new Date(), note: reason });
  await booking.save();
}

/** What a guest gets back if they cancel right now, per the rate plan. */
export function refundFor(booking: Pick<IBooking, "snapshot" | "checkIn" | "pricing" | "status">): {
  amount: number;
  free: boolean;
  hoursLeft: number;
} {
  if (!booking.snapshot.refundable) {
    return { amount: 0, free: false, hoursLeft: 0 };
  }
  const hoursLeft = Math.floor((booking.checkIn.getTime() - Date.now()) / 3_600_000);
  const free = hoursLeft >= booking.snapshot.cancellationHours;
  return {
    amount: free ? booking.pricing.grandTotal : 0,
    free,
    hoursLeft: Math.max(0, hoursLeft),
  };
}

export interface CancelResult {
  refundAmount: number;
  free: boolean;
}

/** Cancels and reverses the money. Used by guests, vendors, and platform staff. */
export async function cancelBooking(
  bookingId: string,
  by: { id: string | null; role: string },
  reason: string,
  overrideRefund?: number,
): Promise<CancelResult> {
  await connectDB();

  return withTransaction(async (session: ClientSession) => {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) throw new BookingError("Booking not found.");
    if (["cancelled", "refunded", "completed", "expired"].includes(booking.status)) {
      throw new BookingError("This booking can no longer be cancelled.");
    }

    const policy = refundFor(booking);
    const refundAmount = overrideRefund ?? policy.amount;

    if (booking.status === "pending_payment") {
      await releaseHold(String(booking.roomId), booking.checkIn, booking.checkOut, booking.units, session);
    } else {
      await releaseBooked(String(booking.roomId), booking.checkIn, booking.checkOut, booking.units, session);
    }

    booking.status = refundAmount > 0 ? "refunded" : "cancelled";
    booking.holdExpiresAt = null;
    booking.cancellation = {
      by: by.id as never,
      byRole: by.role,
      reason,
      at: new Date(),
      refundAmount,
    };
    booking.timeline.push({ status: booking.status, at: new Date(), by: by.id as never, note: reason });
    await booking.save({ session });

    // Reverse the vendor's earning and the platform's commission proportionally.
    if (booking.status === "refunded" || booking.status === "cancelled") {
      const already = await LedgerEntry.countDocuments({
        bookingId: booking._id,
        type: "refund",
      }).session(session);

      if (already === 0 && refundAmount > 0) {
        const share = refundAmount / booking.pricing.grandTotal;
        await LedgerEntry.create(
          [
            {
              vendorId: booking.vendorId,
              bookingId: booking._id,
              type: "refund",
              amount: -Math.round(booking.pricing.vendorEarning * share),
              note: `Refund for ${booking.ref}`,
            },
            {
              vendorId: booking.vendorId,
              bookingId: booking._id,
              type: "commission_reversal",
              amount: Math.round(booking.pricing.commissionAmount * share),
              note: `Commission reversed for ${booking.ref}`,
            },
          ],
          { session, ordered: true },
        );
      }
    }

    if (booking.guestDetails.email) {
      const mail = bookingCancelledTemplate(
        booking.ref,
        booking.guestDetails.fullName || "Guest",
        formatCurrency(refundAmount, booking.pricing.currency),
      );
      void sendMail({
        to: booking.guestDetails.email,
        subject: mail.subject,
        html: mail.html,
        template: "booking-cancelled",
        relatedTo: { entity: "Booking", id: String(booking._id) },
      });
    }

    return { refundAmount, free: policy.free };
  });
}

/**
 * Releases inventory from checkouts that were never paid. Run on a schedule;
 * also called lazily so a cron outage cannot strand rooms forever.
 */
export async function releaseExpiredHolds(): Promise<number> {
  await connectDB();
  const expired = await Booking.find({
    status: "pending_payment",
    holdExpiresAt: { $lt: new Date() },
  }).limit(200);

  let released = 0;
  for (const booking of expired) {
    try {
      await releaseHold(String(booking.roomId), booking.checkIn, booking.checkOut, booking.units);
      booking.status = "expired";
      booking.holdExpiresAt = null;
      booking.timeline.push({ status: "expired", at: new Date(), note: "Payment not completed in time" });
      await booking.save();
      released++;
    } catch (error) {
      console.error("[holds] could not release", booking.ref, error);
    }
  }
  return released;
}

export { InventoryConflictError };
