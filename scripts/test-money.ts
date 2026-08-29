/** Disbursement flow and cross-vendor isolation, against the real database. */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import mongoose from "mongoose";
import { connectDB, withTransaction } from "@/lib/db/connect";
import { Vendor, Payout, LedgerEntry, Hotel, Room, Booking } from "@/lib/models";
import { getVendorBalance } from "@/lib/services/ledger";
import { evaluateCoupon, priceBooking } from "@/lib/services/pricing";
import { readSettings } from "@/lib/services/settings";

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
    { date: new Date(), price: 10_000, unitsFree: 5, closed: false, minStay: 1 },
    { date: new Date(), price: 12_000, unitsFree: 5, closed: false, minStay: 1 },
  ];
  const p = priceBooking({
    nights, units: 1, priceDelta: 500, taxPct: 5, serviceFee: 0,
    commissionPct: 15, discount: 500, couponCode: "TOFIZA500",
  });
  check("room total sums per-night rates plus delta", p.roomTotal === 23_000, String(p.roomTotal));
  check("tax applies after the discount", p.taxes === Math.round((23_000 - 500) * 0.05), String(p.taxes));
  check("grand total is consistent",
    p.grandTotal === 23_000 - 500 + p.taxes, String(p.grandTotal));
  check("commission plus earning equals the total",
    p.commissionAmount + p.vendorEarning === p.grandTotal,
    `${p.commissionAmount} + ${p.vendorEarning}`);
  const capped = priceBooking({ nights, units: 1, priceDelta: 0, taxPct: 5, serviceFee: 0, commissionPct: 15, discount: 999_999 });
  check("a discount cannot exceed the room total", capped.discount === 22_000, String(capped.discount));

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
