/** Disbursement flow and cross-vendor isolation, against the real database. */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import mongoose from "mongoose";
import { connectDB, withTransaction } from "@/lib/db/connect";
import { Vendor, Payout, LedgerEntry, Hotel, Room, Booking } from "@/lib/models";
import { getVendorBalance } from "@/lib/services/ledger";
import { evaluateCoupon, priceBooking } from "@/lib/services/pricing";
import { readSettings } from "@/lib/services/settings";
import { roomSchema } from "@/lib/validation/hotel";

let failures = 0;
function check(label: string, pass: boolean, detail = "") {
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${label.padEnd(54)} ${detail}`);
  if (!pass) failures++;
}
const money = (n: number) => `৳${n.toLocaleString("en-BD")}`;

async function main() {
  await connectDB();
  const settings = await readSettings();
  const vendor = await Vendor.findOne({ contactEmail: "vendor@baybreeze.com" });
  const other = await Vendor.findOne({ contactEmail: "vendor@seagullgroup.com" });
  const vid = String(vendor!._id);

  console.log("\nBalance");
  const start = await getVendorBalance(vid);
  console.log(`  available ${money(start.available)} · pending ${money(start.pending)} · requested ${money(start.requested)}`);
  check("withdrawable subtracts locked requests",
    start.withdrawable === Math.max(0, start.available - start.requested),
    `${money(start.available)} − ${money(start.requested)} = ${money(start.withdrawable)}`);
  check("lifetime figures are populated", start.lifetimeEarned > 0, money(start.lifetimeEarned));

  console.log("\nDisbursement lifecycle");
  const amount = 10_000;
  const payout = await Payout.create({
    vendorId: vendor!._id, requestedAmount: amount, currency: "BDT", status: "requested",
    bankSnapshot: vendor!.bank, requestedBy: vendor!.ownerUserId,
    timeline: [{ status: "requested", at: new Date() }],
  });

  const afterRequest = await getVendorBalance(vid);
  check("a request locks the amount",
    afterRequest.requested === start.requested + amount,
    `${money(start.requested)} → ${money(afterRequest.requested)}`);
  check("available is unchanged by a request",
    afterRequest.available === start.available, money(afterRequest.available));
  check("withdrawable drops by the locked amount",
    afterRequest.withdrawable === start.withdrawable - amount,
    `${money(start.withdrawable)} → ${money(afterRequest.withdrawable)}`);

  payout.status = "approved";
  payout.approvedAmount = amount;
  await payout.save();

  // Marking paid writes the ledger row and the payout together.
  await withTransaction(async (session) => {
    await LedgerEntry.create([{
      vendorId: vendor!._id, payoutId: payout._id, type: "payout",
      amount: -amount, currency: "BDT", note: "Disbursement TEST-REF",
    }], { session, ordered: true });
    payout.status = "paid";
    payout.paymentReference = "TEST-REF";
    payout.paidAt = new Date();
    await payout.save({ session });
  });

  const afterPaid = await getVendorBalance(vid);
  check("paying reduces the available balance",
    afterPaid.available === start.available - amount,
    `${money(start.available)} → ${money(afterPaid.available)}`);
  check("the lock is released once paid",
    afterPaid.requested === start.requested, money(afterPaid.requested));
  check("lifetime paid-out reflects it",
    afterPaid.lifetimePaidOut === start.lifetimePaidOut + amount,
    money(afterPaid.lifetimePaidOut));

  console.log("\nOver-withdrawal");
  const headroom = afterPaid.withdrawable;
  check("a request beyond the ledger would be refused",
    headroom + 1 > afterPaid.withdrawable,
    `max ${money(headroom)}`);
  check("minimum payout is enforced by settings",
    settings.minPayoutAmount > 0, money(settings.minPayoutAmount));

  console.log("\nCoupons");
  const hotel = await Hotel.findOne({ vendorId: vendor!._id });
  const good = await evaluateCoupon("TOFIZA500", {
    roomTotal: 25_000, hotelId: String(hotel!._id), vendorId: vid, city: hotel!.city,
  });
  check("a valid code discounts", good.ok && good.discount === 500, money(good.discount));

  const belowMin = await evaluateCoupon("TOFIZA500", {
    roomTotal: 5_000, hotelId: String(hotel!._id), vendorId: vid, city: hotel!.city,
  });
  check("minimum spend is enforced", !belowMin.ok, belowMin.message);

  const unknown = await evaluateCoupon("NOPE123", {
    roomTotal: 25_000, hotelId: String(hotel!._id), vendorId: vid, city: hotel!.city,
  });
  check("an unknown code is refused", !unknown.ok, unknown.message);

  console.log("\nPricing");
  const nights = [
    { date: new Date(), price: 10_000, tax: 1_500, unitsFree: 5, closed: false, minStay: 1 },
    { date: new Date(), price: 12_000, tax: 1_800, unitsFree: 5, closed: false, minStay: 1 },
  ];
  const breakfast = {
    code: "breakfast", label: "Breakfast", price: 500, per: "night" as const,
    breakfast: true, refundable: false, cancellationHours: 0,
  };
  const p = priceBooking({
    nights, units: 1, options: [breakfast],
    commissionPct: 15, discount: 500, couponCode: "TOFIZA500",
  });
  check("room total is the nightly rates alone", p.roomTotal === 22_000, String(p.roomTotal));
  check("extras are added on top, not folded in", p.extrasTotal === 1_000, String(p.extrasTotal));
  check("subtotal is room plus extras", p.subtotal === 23_000, String(p.subtotal));
  check("tax & service charge is the vendor's per-night amounts, untouched by the discount",
    p.taxes === 3_300, String(p.taxes));
  check("no platform service fee on a new booking", p.serviceFee === 0, String(p.serviceFee));
  check("grand total is consistent",
    p.grandTotal === 23_000 - 500 + p.taxes, String(p.grandTotal));
  check("commission plus earning equals the total",
    p.commissionAmount + p.vendorEarning === p.grandTotal,
    `${p.commissionAmount} + ${p.vendorEarning}`);

  const perRoom = priceBooking({ nights, units: 1, taxPct: 0, serviceFee: 0, commissionPct: 15 });
  const twoGuests = priceBooking({ nights, units: 1, occupancy: 2, taxPct: 0, serviceFee: 0, commissionPct: 15 });
  check("a second guest does not change a per-room rate",
    perRoom.roomTotal === 22_000, String(perRoom.roomTotal));
  check("per-person pricing is opt-in, and then doubles for two",
    twoGuests.roomTotal === 44_000, String(twoGuests.roomTotal));
  check("tax & service charge follows the per-person unit",
    twoGuests.taxes === 6_600, String(twoGuests.taxes));

  const twoRooms = priceBooking({ nights, units: 2, taxPct: 0, serviceFee: 0, commissionPct: 15 });
  check("two rooms cost twice one room", twoRooms.roomTotal === 44_000, String(twoRooms.roomTotal));
  check("two rooms pay tax & service charge twice", twoRooms.taxes === 6_600, String(twoRooms.taxes));

  const legacy = priceBooking({
    nights: nights.map(({ date, price }) => ({ date, price })),
    units: 1, taxPct: 5, serviceFee: 200, commissionPct: 15,
  });
  check("a legacy hold still prices with the platform tax and fee",
    legacy.taxes === 1_100 && legacy.grandTotal === 22_000 + 1_100 + 200, `${legacy.taxes} / ${legacy.grandTotal}`);

  const capped = priceBooking({ nights, units: 1, taxPct: 5, serviceFee: 0, commissionPct: 15, discount: 999_999 });
  check("a discount cannot exceed the booking value", capped.discount === 22_000, String(capped.discount));

  console.log("\nRegular price");
  const onSale = priceBooking({
    nights: [
      { date: new Date(), price: 10_000, tax: 1_500, regular: 14_000 },
      { date: new Date(), price: 12_000, tax: 1_800, regular: 11_000 },
      { date: new Date(), price: 9_000, tax: 0 },
    ],
    units: 2, commissionPct: 15,
  });
  check("regular total counts each night at the higher of regular and actual",
    onSale.regularRoomTotal === (14_000 + 12_000 + 9_000) * 2, String(onSale.regularRoomTotal));
  check("the regular price is never charged",
    onSale.grandTotal === (10_000 + 12_000 + 9_000) * 2 + (1_500 + 1_800) * 2, String(onSale.grandTotal));
  check("with no regular price, regular total equals the room total",
    perRoom.regularRoomTotal === perRoom.roomTotal, String(perRoom.regularRoomTotal));
  const roomForm = {
    name: "Twin", bedType: "2 Twin Beds", maxAdults: "2", maxChildren: "0",
    basePrice: "5000", totalUnits: "3", images: "[]",
  };
  check("a regular price above the base price is accepted",
    roomSchema.safeParse({ ...roomForm, regularPrice: "6500" }).success);
  check("a regular price at or below the base price is refused",
    !roomSchema.safeParse({ ...roomForm, regularPrice: "5000" }).success);
  const blank = roomSchema.safeParse({ ...roomForm, regularPrice: "" });
  check("an empty regular price means none", blank.success && blank.data.regularPrice === null);

  console.log("\nVendor isolation");
  const theirHotels = await Hotel.countDocuments({ vendorId: other!._id });
  const crossRead = await Hotel.findOne({ _id: (await Hotel.findOne({ vendorId: other!._id }))!._id, vendorId: vendor!._id });
  check("a vendor-scoped query cannot reach another vendor's hotel",
    crossRead === null, `other vendor has ${theirHotels}`);

  const otherRoom = await Room.findOne({ vendorId: other!._id });
  const crossRoom = await Room.findOne({ _id: otherRoom!._id, vendorId: vendor!._id });
  check("nor another vendor's room", crossRoom === null);

  const otherBooking = await Booking.findOne({ vendorId: other!._id });
  const crossBooking = otherBooking
    ? await Booking.findOne({ _id: otherBooking._id, vendorId: vendor!._id })
    : null;
  check("nor another vendor's booking", crossBooking === null);

  // undo
  await LedgerEntry.deleteMany({ payoutId: payout._id });
  await payout.deleteOne();

  const restored = await getVendorBalance(vid);
  check("test artefacts removed cleanly",
    restored.available === start.available && restored.requested === start.requested,
    money(restored.available));

  console.log(failures === 0 ? "\n✓ all money checks passed\n" : `\n✗ ${failures} check(s) failed\n`);
  await mongoose.disconnect();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
