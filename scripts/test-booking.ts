/** End-to-end exercise of the booking flow against the real database. */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Booking, Payment, Room, RoomInventory, LedgerEntry, Hotel } from "@/lib/models";
import {
  startBooking, confirmBooking, cancelBooking, releaseExpiredHolds, BookingError,
} from "@/lib/services/booking-flow";
import { InventoryConflictError, toNight, toDateKey } from "@/lib/services/inventory";
import { getRoomOffers } from "@/lib/services/public-hotels";

let failures = 0;
function check(label: string, pass: boolean, detail = "") {
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${label.padEnd(56)} ${detail}`);
  if (!pass) failures++;
}

const day = (n: number) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

async function freeUnits(roomId: string, dateKey: string) {
  const row = await RoomInventory.findOne({ roomId, date: toNight(dateKey) }).lean();
  if (!row) return null;
  return { total: row.unitsTotal, booked: row.unitsBooked, held: row.unitsHeld };
}

async function main() {
  await connectDB();
  const hotel = await Hotel.findOne({ name: /Peninsula/ }).lean();
  const room = await Room.findOne({ hotelId: hotel!._id, name: /Superior/ }).lean();
  const roomId = String(room!._id);
  const checkIn = day(20);
  const checkOut = day(22);

  console.log(`\nRoom: ${room!.name} (${room!.totalUnits} units) · ${checkIn} → ${checkOut}`);

  // clean slate for this window
  await Booking.deleteMany({ roomId: room!._id, checkIn: { $gte: toNight(checkIn) } });
  await RoomInventory.updateMany(
    { roomId: room!._id, date: { $gte: toNight(checkIn), $lt: toNight(day(23)) } },
    { $set: { unitsHeld: 0, unitsBooked: 0, closed: false } },
  );

  const before = await freeUnits(roomId, checkIn);
  console.log(`  starting inventory: ${before!.total} total, ${before!.booked} booked, ${before!.held} held\n`);

  console.log("Holding");
  const ref = await startBooking({
    roomId, ratePlanCode: "breakfast", checkIn, checkOut,
    units: 1, adults: 2, children: 0,
  });
  check("startBooking returns a reference", /^TFZ[A-Z0-9]{6}$/.test(ref), ref);

  let booking = await Booking.findOne({ ref });
  check("booking is pending_payment", booking!.status === "pending_payment");
  check("hold has an expiry", booking!.holdExpiresAt != null,
    booking!.holdExpiresAt?.toISOString().slice(11, 19));

  let inv = await freeUnits(roomId, checkIn);
  check("one unit is held, none booked", inv!.held === 1 && inv!.booked === 0,
    `held ${inv!.held} booked ${inv!.booked}`);

  // Derived from the actual inventory rows, which carry weekend uplift, rather
  // than assuming a flat base price.
  const rows = await RoomInventory.find({
    roomId: room!._id,
    date: { $gte: toNight(checkIn), $lt: toNight(checkOut) },
  }).sort({ date: 1 }).lean();
  const expected = rows.reduce((sum, r) => sum + (r.priceOverride ?? room!.basePrice) + 900, 0);
  check("price follows per-night rates plus the plan delta",
    booking!.pricing.roomTotal === expected,
    `${booking!.pricing.roomTotal} = ${rows.map((r) => (r.priceOverride ?? room!.basePrice) + 900).join(" + ")}`);
  check("weekend uplift is actually applied",
    rows.some((r) => r.priceOverride != null),
    rows.map((r) => `${toDateKey(r.date)}:${r.priceOverride ?? "base"}`).join(" "));
  check("commission split adds up",
    booking!.pricing.commissionAmount + booking!.pricing.vendorEarning === booking!.pricing.grandTotal,
    `${booking!.pricing.commissionAmount} + ${booking!.pricing.vendorEarning} = ${booking!.pricing.grandTotal}`);

  console.log("\nOverselling");
  await RoomInventory.updateMany(
    { roomId: room!._id, date: { $gte: toNight(checkIn), $lt: toNight(checkOut) } },
    { $set: { unitsTotal: 1 } },
  );
  let blocked = false;
  try {
    await startBooking({ roomId, ratePlanCode: "room-only", checkIn, checkOut, units: 1, adults: 2, children: 0 });
  } catch (e) {
    blocked = e instanceof BookingError || e instanceof InventoryConflictError;
  }
  check("a second hold on the last room is refused", blocked);
  const holdCount = await Booking.countDocuments({ roomId: room!._id, checkIn: toNight(checkIn), status: "pending_payment" });
  check("no orphan booking was written", holdCount === 1, `${holdCount} pending`);

  console.log("\nConfirming");
  const payment = await Payment.create({
    bookingId: booking!._id, tranId: `TEST-${ref}`,
    amount: booking!.pricing.grandTotal, currency: "BDT",
    status: "success", valId: "test", validatedAt: new Date(),
  });
  const first = await confirmBooking(String(booking!._id), String(payment._id));
  check("confirmBooking confirms", first.confirmed && !first.alreadyDone);

  const second = await confirmBooking(String(booking!._id), String(payment._id));
  check("a repeated confirm is a no-op (idempotent)", second.confirmed && second.alreadyDone);

  inv = await freeUnits(roomId, checkIn);
  check("held converts to booked", inv!.held === 0 && inv!.booked === 1,
    `held ${inv!.held} booked ${inv!.booked}`);

  booking = await Booking.findOne({ ref });
  check("status is confirmed", booking!.status === "confirmed");
  check("hold expiry cleared", booking!.holdExpiresAt === null);

  const ledger = await LedgerEntry.find({ bookingId: booking!._id }).lean();
  const earning = ledger.find((l) => l.type === "earning");
  const commission = ledger.find((l) => l.type === "commission");
  check("ledger has exactly two entries", ledger.length === 2, `${ledger.length} rows`);
  check("earning credits the vendor", earning!.amount === booking!.pricing.vendorEarning, `+${earning!.amount}`);
  check("commission debits the vendor", commission!.amount === -booking!.pricing.commissionAmount, `${commission!.amount}`);
  check("earning is not yet withdrawable", earning!.availableAt! > new Date(),
    `available ${earning!.availableAt!.toISOString().slice(0, 10)}`);

  console.log("\nAvailability now reflects the sale");
  const offers = await getRoomOffers(String(hotel!._id), checkIn, checkOut, 1);
  const thisRoom = offers[roomId];
  check("the sold-out room is offered as unavailable",
    thisRoom.every((o) => !o.available), thisRoom[0]?.reason ?? "");

  console.log("\nCancelling");
  await cancelBooking(String(booking!._id), { id: null, role: "test" }, "automated test");
  booking = await Booking.findOne({ ref });
  check("status moves to refunded or cancelled",
    ["refunded", "cancelled"].includes(booking!.status), booking!.status);
  inv = await freeUnits(roomId, checkIn);
  check("the room goes back on sale", inv!.booked === 0, `booked ${inv!.booked}`);

  const after = await LedgerEntry.find({ bookingId: booking!._id }).lean();
  const net = after.reduce((s, l) => s + l.amount, 0);
  check("ledger nets to zero after a full refund", Math.abs(net) <= 1, `net ${net}`);

  console.log("\nHold expiry");
  const ref2 = await startBooking({
    roomId, ratePlanCode: "room-only", checkIn, checkOut, units: 1, adults: 2, children: 0,
  });
  await Booking.updateOne({ ref: ref2 }, { $set: { holdExpiresAt: new Date(Date.now() - 1000) } });
  const released = await releaseExpiredHolds();
  const expired = await Booking.findOne({ ref: ref2 });
  check("the sweeper expires stale holds", released >= 1 && expired!.status === "expired",
    `released ${released}`);
  inv = await freeUnits(roomId, checkIn);
  check("expired holds free their units", inv!.held === 0, `held ${inv!.held}`);

  // tidy up
  await Booking.deleteMany({ ref: { $in: [ref, ref2] } });
  await Payment.deleteMany({ tranId: `TEST-${ref}` });
  await LedgerEntry.deleteMany({ bookingId: booking!._id });
  await RoomInventory.updateMany(
    { roomId: room!._id, date: { $gte: toNight(checkIn), $lt: toNight(day(23)) } },
    { $set: { unitsTotal: room!.totalUnits, unitsHeld: 0, unitsBooked: 0 } },
  );

  console.log(failures === 0 ? "\n✓ all booking checks passed\n" : `\n✗ ${failures} check(s) failed\n`);
  await mongoose.disconnect();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
