import { connectDB } from "@/lib/db/connect";
import { Booking } from "@/lib/models/Booking";
import { getSessionUser } from "@/lib/auth/guards";

export interface CheckoutBooking {
  id: string;
  ref: string;
  status: string;
  hotelName: string;
  hotelSlug: string;
  hotelCity: string;
  hotelAddress: string;
  hotelImage?: string;
  roomName: string;
  ratePlanName: string;
  breakfast: boolean;
  refundable: boolean;
  cancellationHours: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  units: number;
  guests: { adults: number; children: number };
  guestDetails: { fullName: string; email: string; phone: string; specialRequests?: string };
  pricing: {
    roomTotal: number;
    taxes: number;
    serviceFee: number;
    discount: number;
    couponCode: string | null;
    grandTotal: number;
    currency: string;
  };
  holdExpiresAt: string | null;
  holdSecondsLeft: number;
}

/**
 * Reads a booking for the checkout flow. The reference is the credential for a
 * booking started before sign-in; once claimed, only its owner (or platform
 * staff) can see it.
 */
export async function getCheckoutBooking(ref: string): Promise<CheckoutBooking | null> {
  await connectDB();
  const booking = await Booking.findOne({ ref: ref.toUpperCase() }).lean();
  if (!booking) return null;

  if (booking.customerId) {
    const user = await getSessionUser();
    const isOwner = user?.id === String(booking.customerId);
    const isStaff = user?.role === "platform";
    if (!isOwner && !isStaff) return null;
  }

  const holdMs = booking.holdExpiresAt ? booking.holdExpiresAt.getTime() - Date.now() : 0;

  return {
    id: String(booking._id),
    ref: booking.ref,
    status: booking.status,
    hotelName: booking.snapshot.hotelName,
    hotelSlug: booking.snapshot.hotelSlug,
    hotelCity: booking.snapshot.hotelCity,
    hotelAddress: booking.snapshot.hotelAddress,
    hotelImage: booking.snapshot.hotelImage,
    roomName: booking.snapshot.roomName,
    ratePlanName: booking.snapshot.ratePlanName,
    breakfast: booking.snapshot.breakfast,
    refundable: booking.snapshot.refundable,
    cancellationHours: booking.snapshot.cancellationHours,
    checkIn: booking.checkIn.toISOString(),
    checkOut: booking.checkOut.toISOString(),
    nights: booking.nights,
    units: booking.units,
    guests: booking.guests,
    guestDetails: booking.guestDetails,
    pricing: {
      roomTotal: booking.pricing.roomTotal,
      taxes: booking.pricing.taxes,
      serviceFee: booking.pricing.serviceFee,
      discount: booking.pricing.discount,
      couponCode: booking.pricing.couponCode ?? null,
      grandTotal: booking.pricing.grandTotal,
      currency: booking.pricing.currency,
    },
    holdExpiresAt: booking.holdExpiresAt?.toISOString() ?? null,
    holdSecondsLeft: Math.max(0, Math.floor(holdMs / 1000)),
  };
}
