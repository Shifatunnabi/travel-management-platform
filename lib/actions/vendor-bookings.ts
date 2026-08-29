"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { requireVendor } from "@/lib/auth/guards";
import { Booking } from "@/lib/models/Booking";
import { cancelBooking, BookingError } from "@/lib/services/booking-flow";
import { releaseBooked } from "@/lib/services/inventory";
import { audit } from "@/lib/services/audit";
import { bookingStatusSchema } from "@/lib/validation/booking";
import { fail, parseForm, succeed, type ActionState } from "./_result";

/** Check-in, check-out, no-show, or cancellation from the property's side. */
export async function updateBookingStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseForm(bookingStatusSchema, formData);
  if (!parsed.ok) return parsed.state;

  const user = await requireVendor(["owner", "manager", "staff"]);
  const { ref, action, reason } = parsed.data;

  await connectDB();
  const booking = await Booking.findOne({ ref: ref.toUpperCase(), vendorId: user.vendorId });
  if (!booking) return fail("We could not find that booking.");

  if (action === "cancel") {
    if (!reason?.trim()) {
      return fail("Give the guest a reason.", { reason: ["A reason is required."] });
    }
    try {
      const result = await cancelBooking(
        String(booking._id),
        { id: user.id, role: `vendor:${user.vendorRole}` },
        reason,
      );
      await audit({
        actor: user, action: "booking.vendor_cancel", entity: "Booking",
        entityId: String(booking._id), reason,
        after: { refundAmount: result.refundAmount },
      });
      revalidatePath("/vendor/bookings");
      return succeed(
        result.refundAmount > 0
          ? `Cancelled. The guest will be refunded ৳${result.refundAmount.toLocaleString("en-BD")}.`
          : "Cancelled. No refund was due under this rate plan.",
      );
    } catch (error) {
      if (error instanceof BookingError) return fail(error.message);
      throw error;
    }
  }

  const transitions: Record<string, { from: string[]; to: string; label: string }> = {
    check_in: { from: ["confirmed"], to: "checked_in", label: "Checked in." },
    check_out: { from: ["checked_in"], to: "completed", label: "Checked out — the stay is complete." },
    no_show: { from: ["confirmed"], to: "no_show", label: "Marked as a no-show." },
  };

  const t = transitions[action];
  if (!t.from.includes(booking.status)) {
    return fail(`A booking that is ${booking.status.replace(/_/g, " ")} cannot be ${action.replace(/_/g, " ")}.`);
  }

  // Check-out and no-show both end the stay, so the room goes back on sale.
  if (t.to === "completed" || t.to === "no_show") {
    await releaseBooked(String(booking.roomId), booking.checkIn, booking.checkOut, booking.units);
  }

  booking.status = t.to as typeof booking.status;
  booking.timeline.push({ status: booking.status, at: new Date(), by: user.id as never, note: reason });
  await booking.save();

  await audit({
    actor: user, action: `booking.${action}`, entity: "Booking",
    entityId: String(booking._id), after: { status: booking.status },
  });

  revalidatePath("/vendor/bookings");
  return succeed(t.label);
}
