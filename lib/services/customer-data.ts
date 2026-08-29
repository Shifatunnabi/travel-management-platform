import { connectDB } from "@/lib/db/connect";
import { Booking } from "@/lib/models/Booking";
import { Review } from "@/lib/models/Review";
import type { BookingStatus } from "@/lib/models/types";
import { refundFor } from "./booking-flow";

export interface CustomerBooking {
  id: string;
  ref: string;
  status: BookingStatus;
  hotelName: string;
  hotelSlug: string;
  hotelCity: string;
  hotelImage?: string;
  roomName: string;
  ratePlanName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  units: number;
  guests: { adults: number; children: number };
  total: number;
  currency: string;
  refundable: boolean;
  cancellationHours: number;
  refundIfCancelledNow: number;
  freeCancellation: boolean;
  canCancel: boolean;
  canReview: boolean;
  hasReview: boolean;
  createdAt: string;
}

const UPCOMING: BookingStatus[] = ["confirmed", "checked_in"];

export async function listCustomerBookings(
  customerId: string,
  filter: "upcoming" | "past" | "cancelled" | "all" = "upcoming",
): Promise<CustomerBooking[]> {
  await connectDB();

  const query: Record<string, unknown> = { customerId };
  if (filter === "upcoming") query.status = { $in: UPCOMING };
  else if (filter === "past") query.status = { $in: ["completed"] };
  else if (filter === "cancelled") query.status = { $in: ["cancelled", "refunded", "expired", "no_show"] };
  else query.status = { $ne: "pending_payment" };

  const bookings = await Booking.find(query).sort({ checkIn: -1 }).limit(100).lean();
  const ids = bookings.map((b) => b._id);
  const reviews = await Review.find({ bookingId: { $in: ids } }).select("bookingId").lean();
  const reviewed = new Set(reviews.map((r) => String(r.bookingId)));

  return bookings.map((b) => {
    const policy = refundFor(b);
    const hasReview = reviewed.has(String(b._id));
    return {
      id: String(b._id),
      ref: b.ref,
      status: b.status,
      hotelName: b.snapshot.hotelName,
      hotelSlug: b.snapshot.hotelSlug,
      hotelCity: b.snapshot.hotelCity,
      hotelImage: b.snapshot.hotelImage,
      roomName: b.snapshot.roomName,
      ratePlanName: b.snapshot.ratePlanName,
      checkIn: b.checkIn.toISOString(),
      checkOut: b.checkOut.toISOString(),
      nights: b.nights,
      units: b.units,
      guests: b.guests,
      total: b.pricing.grandTotal,
      currency: b.pricing.currency,
      refundable: b.snapshot.refundable,
      cancellationHours: b.snapshot.cancellationHours,
      refundIfCancelledNow: policy.amount,
      freeCancellation: policy.free,
      canCancel: UPCOMING.includes(b.status) && b.checkIn.getTime() > Date.now(),
      canReview: b.status === "completed" && !hasReview,
      hasReview,
      createdAt: b.createdAt.toISOString(),
    };
  });
}

export async function getCustomerStats(customerId: string) {
  await connectDB();
  const [counts] = await Booking.aggregate<{
    total: number;
    completed: number;
    upcoming: number;
    spent: number;
  }>([
    { $match: { customerId: (await import("mongoose")).Types.ObjectId.createFromHexString(customerId) } },
    {
      $group: {
        _id: null,
        total: { $sum: { $cond: [{ $ne: ["$status", "pending_payment"] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        upcoming: { $sum: { $cond: [{ $in: ["$status", UPCOMING] }, 1, 0] } },
        spent: {
          $sum: {
            $cond: [{ $in: ["$status", ["confirmed", "checked_in", "completed"]] }, "$pricing.grandTotal", 0],
          },
        },
      },
    },
  ]);

  return {
    total: counts?.total ?? 0,
    completed: counts?.completed ?? 0,
    upcoming: counts?.upcoming ?? 0,
    spent: counts?.spent ?? 0,
  };
}
