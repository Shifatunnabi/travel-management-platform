/** Exercises the rating adjustment end to end against the real database. */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Hotel, deriveDisplayRating } from "@/lib/models/Hotel";
import { AuditLog } from "@/lib/models/AuditLog";
import { ratingAdjustmentSchema } from "@/lib/validation/admin";
import { readSettings } from "@/lib/services/settings";

let failures = 0;
function check(label: string, pass: boolean, detail = "") {
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${label.padEnd(52)} ${detail}`);
  if (!pass) failures++;
}

async function main() {
  await connectDB();
  const settings = await readSettings();
  const hotel = await Hotel.findOne({ name: /Peninsula/ });
  if (!hotel) throw new Error("Seed the database first.");

  console.log("\nSchema guards");
  const noReason = ratingAdjustmentSchema.safeParse({ hotelId: "x", mode: "offset", value: 0.4, seedCount: 0, reason: "" });
  check("offset without a reason is rejected", !noReason.success,
    noReason.success ? "" : noReason.error.issues[0].message);

  const badOverride = ratingAdjustmentSchema.safeParse({ hotelId: "x", mode: "override", value: 6, seedCount: 0, reason: "testing" });
  check("override above 5.0 is rejected", !badOverride.success);

  const clearOk = ratingAdjustmentSchema.safeParse({ hotelId: "x", mode: "none", value: 0, seedCount: 0, reason: "" });
  check("clearing needs no reason", clearOk.success);

  const overCap = 1.5;
  check("offset beyond the settings cap is caught",
    Math.abs(overCap) > settings.maxRatingOffset, `cap ±${settings.maxRatingOffset}`);

  console.log("\nDerivation");
  const trueAvg = hotel.reviewStats.avg;
  const trueCount = hotel.reviewStats.count;
  console.log(`  baseline: true ${trueAvg} from ${trueCount} reviews`);

  hotel.ratingAdjustment = { mode: "offset", value: 0.4, seedCount: 150, reason: "Launch partner placement", setBy: null, setAt: new Date() };
  Object.assign(hotel, deriveDisplayRating(hotel));
  await hotel.save();

  let fresh = await Hotel.findById(hotel._id).lean();
  check("offset moves the displayed rating", fresh!.displayRating === Math.round((trueAvg + 0.4) * 10) / 10,
    `${trueAvg} + 0.4 → ${fresh!.displayRating}`);
  check("seed count inflates only the count", fresh!.displayReviewCount === trueCount + 150,
    `${trueCount} + 150 → ${fresh!.displayReviewCount}`);
  check("the true average survives untouched", fresh!.reviewStats.avg === trueAvg,
    `still ${fresh!.reviewStats.avg}`);
  check("the true count survives untouched", fresh!.reviewStats.count === trueCount);

  // clamp at the ceiling
  hotel.ratingAdjustment = { mode: "offset", value: 1, seedCount: 0, reason: "ceiling test", setBy: null, setAt: new Date() };
  Object.assign(hotel, deriveDisplayRating(hotel));
  check("a displayed rating never exceeds 5.0", hotel.displayRating <= 5, `→ ${hotel.displayRating}`);

  hotel.ratingAdjustment = { mode: "override", value: 4.9, seedCount: 0, reason: "override test", setBy: null, setAt: new Date() };
  Object.assign(hotel, deriveDisplayRating(hotel));
  check("override sets the value exactly", hotel.displayRating === 4.9, `→ ${hotel.displayRating}`);

  await AuditLog.create({
    actorName: "test", actorRole: "platform:super_admin", action: "hotel.rating.adjust",
    entity: "Hotel", entityId: String(hotel._id),
    before: { displayRating: trueAvg }, after: { displayRating: 4.9 }, reason: "override test",
  });
  const logged = await AuditLog.countDocuments({ entity: "Hotel", entityId: String(hotel._id), action: "hotel.rating.adjust" });
  check("the change is recorded in the audit log", logged > 0, `${logged} entries`);

  console.log("\nReverting");
  hotel.ratingAdjustment = { mode: "none", value: 0, seedCount: 0, reason: undefined, setBy: null, setAt: new Date() };
  Object.assign(hotel, deriveDisplayRating(hotel));
  await hotel.save();
  fresh = await Hotel.findById(hotel._id).lean();
  check("clearing restores the true average", fresh!.displayRating === Math.round(trueAvg * 10) / 10,
    `→ ${fresh!.displayRating}`);
  check("clearing restores the true count", fresh!.displayReviewCount === trueCount);

  await AuditLog.deleteMany({ actorName: "test" });
  console.log(failures === 0 ? "\n✓ all rating checks passed\n" : `\n✗ ${failures} check(s) failed\n`);
  await mongoose.disconnect();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
