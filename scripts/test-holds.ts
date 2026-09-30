/**
 * The 15-minute hold, under the conditions that used to break it: abandoned
 * checkouts never released, a payment landing after expiry, the sweeper racing
 * a payment, and one visitor hoarding rooms.
 *
 * Builds its own throwaway room under an existing hotel, a year out, and removes
 * everything it made — it never touches real inventory or bookings.
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Booking, Hotel, LedgerEntry, Room, RoomInventory } from "@/lib/models";
import {
  startBooking, confirmBooking, failBooking, releaseExpiredHolds, BookingError,
} from "@/lib/services/booking-flow";
import { toNight } from "@/lib/services/inventory";
import { getRoomOffer } from "@/lib/services/public-hotels";

let failures = 0;
function check(label: string, pass: boolean, detail = "") {
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${label.padEnd(62)} ${detail}`);
  if (!pass) failures++;
}

const day = (n: number) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 400 + n);
  return d.toISOString().slice(0, 10);
};

async function units(roomId: string, date: string) {
  const row = await RoomInventory.findOne({ roomId, date: toNight(date) }).lean();
  return row ? { held: row.unitsHeld, booked: row.unitsBooked } : { held: 0, booked: 0 };
}

async function expire(ref: string) {
  await Booking.updateOne({ ref }, { $set: { holdExpiresAt: new Date(Date.now() - 1000) } });
}

async function main() {
  await connectDB();
  const hotel = await Hotel.findOne({ status: "published" }).lean();
  if (!hotel) throw new Error("No published hotel to hang a test room on.");

  const room = await Room.create({
    hotelId: hotel._id, vendorId: hotel.vendorId, name: "ZZ Hold Test Room",
    basePrice: 1000, totalUnits: 1, maxAdults: 2, maxChildren: 0,
  });
  const roomId = String(room._id);
  const made: string[] = [];

  try {
    const base = {
      roomId, units: 1, adults: 2, children: 0,
    };

    console.log("\nA slug is issued");
    check("room got a slug with seven digits", /^zz-hold-test-room-\d{7}$/.test(room.slug ?? ""), room.slug);

    console.log("\nExpired holds free themselves");
    const a = await startBooking({ ...base, checkIn: day(0), checkOut: day(1), customerId: String(new mongoose.Types.ObjectId()) });
    made.push(a);
    check("the room is held", (await units(roomId, day(0))).held === 1);
    const blocked = await getRoomOffer(roomId, day(0), day(1), 1, 2);
    check("others are told to wait", blocked?.available === false && blocked.heldOnly);

    await expire(a);
    const reread = await getRoomOffer(roomId, day(0), day(1), 1, 2);
    check("the next page view releases it — no cron needed", reread?.available === true);
    check("booking is marked expired", (await Booking.findOne({ ref: a }))?.status === "expired");
    check("no units left held", (await units(roomId, day(0))).held === 0);

    console.log("\nPaying after the hold expired");
    const late = await startBooking({ ...base, checkIn: day(10), checkOut: day(11) });
    made.push(late);
    const lateId = String((await Booking.findOne({ ref: late }))!._id);
    await expire(late);
    await releaseExpiredHolds();
    check("hold was released", (await units(roomId, day(10))).held === 0);
    const revived = await confirmBooking(lateId, String(new mongoose.Types.ObjectId()));
    check("late payment re-takes a free room and confirms", revived.confirmed === true);
    check("room is now sold", (await units(roomId, day(10))).booked === 1);

    console.log("\nPaying after the hold expired AND the room was resold");
    const first = await startBooking({ ...base, checkIn: day(20), checkOut: day(21) });
    made.push(first);
    const firstId = String((await Booking.findOne({ ref: first }))!._id);
    await expire(first);
    await releaseExpiredHolds();
    const second = await startBooking({ ...base, checkIn: day(20), checkOut: day(21) });
    made.push(second);
    const secondId = String((await Booking.findOne({ ref: second }))!._id);
    await confirmBooking(secondId, String(new mongoose.Types.ObjectId()));
    const lost = await confirmBooking(firstId, String(new mongoose.Types.ObjectId()));
    check("reports the room as lost instead of pretending", lost.roomLost === true && !lost.confirmed);
    check("the late booking stays expired", (await Booking.findById(firstId))?.status === "expired");
    check("the other guest's booking is untouched", (await Booking.findById(secondId))?.status === "confirmed");
    check("inventory is not double-sold", (await units(roomId, day(20))).booked === 1);

    console.log("\nThe sweeper cannot undo a payment");
    const raced = await startBooking({ ...base, checkIn: day(30), checkOut: day(31) });
    made.push(raced);
    const racedId = String((await Booking.findOne({ ref: raced }))!._id);
    await expire(raced);
    await Promise.all([
      confirmBooking(racedId, String(new mongoose.Types.ObjectId())),
      releaseExpiredHolds(),
    ]);
    const after = await Booking.findById(racedId);
    const inv = await units(roomId, day(30));
    check("booking ends in exactly one coherent state",
      (after?.status === "confirmed" && inv.booked === 1 && inv.held === 0) ||
      (after?.status === "expired" && inv.booked === 0 && inv.held === 0),
      `${after?.status} booked=${inv.booked} held=${inv.held}`);

    console.log("\nA failed payment frees the room once");
    const fail = await startBooking({ ...base, checkIn: day(40), checkOut: day(41) });
    made.push(fail);
    const failId = String((await Booking.findOne({ ref: fail }))!._id);
    await failBooking(failId, "Payment failed");
    await failBooking(failId, "Payment failed");
    check("released, and a repeat notice does not release twice", (await units(roomId, day(40))).held === 0);
    const confirmedAfter = await startBooking({ ...base, checkIn: day(40), checkOut: day(41) });
    made.push(confirmedAfter);
    const cId = String((await Booking.findOne({ ref: confirmedAfter }))!._id);
    await confirmBooking(cId, String(new mongoose.Types.ObjectId()));
    await failBooking(cId, "Late failure notice");
    check("a late failure cannot cancel a confirmed booking", (await Booking.findById(cId))?.status === "confirmed");
    check("…or release its room", (await units(roomId, day(40))).booked === 1);

    console.log("\nOne visitor cannot hold everything");
    await Room.updateOne({ _id: roomId }, { $set: { totalUnits: 10 } });
    await RoomInventory.deleteMany({ roomId });
    const ip = "203.0.113.9";
    let refused = 0;
    for (let i = 0; i < 5; i++) {
      try {
        made.push(await startBooking({ ...base, checkIn: day(50 + i), checkOut: day(51 + i), clientIp: ip }));
      } catch (error) {
        if (error instanceof BookingError) refused++;
        else throw error;
      }
    }
    check("the fourth and fifth open holds are refused", refused === 2, `${refused} refused`);
  } finally {
    const bookings = await Booking.find({ roomId }).select("_id").lean();
    await LedgerEntry.deleteMany({ bookingId: { $in: bookings.map((b) => b._id) } });
    await Booking.deleteMany({ roomId });
    await RoomInventory.deleteMany({ roomId });
    await Room.deleteOne({ _id: roomId });
    void made;
  }

  console.log(failures === 0 ? "\nAll hold checks passed.\n" : `\n${failures} check(s) FAILED.\n`);
  await mongoose.disconnect();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
