import { Types } from "mongoose";
import { connectDB, withTransaction } from "@/lib/db/connect";
import { Booking } from "@/lib/models/Booking";
import { releaseHold } from "./inventory";

export interface HoldScope {
  roomIds?: string[];
  hotelIds?: string[];
}

const toIds = (ids?: string[]) => ids?.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));

/**
 * Gives back rooms held by checkouts that were never paid.
 *
 * Each booking is expired and its units released in one transaction, and only
 * if it is still `pending_payment` and still past its expiry when the
 * transaction runs. That is what stops this racing a payment that lands at the
 * same moment: whichever transaction commits first wins, and the other one
 * retries and sees the new state — it can no longer expire a booking that was
 * just confirmed, or release units somebody else now holds.
 *
 * Pass a scope to sweep only what a page is about to show. Called from every
 * path that reads availability, so a stalled scheduler cannot leave rooms
 * blocked — the cron route is a backstop, not the mechanism.
 */
export async function releaseExpiredHolds(scope: HoldScope = {}): Promise<number> {
  await connectDB();

  const filter: Record<string, unknown> = {
    status: "pending_payment",
    holdExpiresAt: { $lt: new Date() },
  };
  const roomIds = toIds(scope.roomIds);
  const hotelIds = toIds(scope.hotelIds);
  if (roomIds) filter.roomId = { $in: roomIds };
  if (hotelIds) filter.hotelId = { $in: hotelIds };

  const candidates = await Booking.find(filter).select("_id").limit(200).lean();

  let released = 0;
  for (const { _id } of candidates) {
    try {
      const done = await withTransaction(async (session) => {
        const booking = await Booking.findOneAndUpdate(
          { _id, status: "pending_payment", holdExpiresAt: { $lt: new Date() } },
          {
            $set: { status: "expired", holdExpiresAt: null },
            $push: {
              timeline: { status: "expired", at: new Date(), note: "Payment not completed in time" },
            },
          },
          { session, returnDocument: "before" },
        ).lean();
        if (!booking) return false; // paid, cancelled or already swept in the meantime

        await releaseHold(String(booking.roomId), booking.checkIn, booking.checkOut, booking.units, session);
        return true;
      });
      if (done) released++;
    } catch (error) {
      console.error("[holds] could not release", String(_id), error);
    }
  }
  return released;
}

/** The same sweep for read paths, where a failure must never break the page. */
export async function sweepHolds(scope: HoldScope): Promise<void> {
  try {
    await releaseExpiredHolds(scope);
  } catch (error) {
    console.error("[holds] sweep failed:", error);
  }
}
