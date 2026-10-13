/** Regression against a running app with seeded vendor credentials.
 * Uses disposable hotel, room and inventory records. Set CALENDAR_TEST_BASE
 * to test a production server (default http://localhost:3100).
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import assert from "node:assert/strict";
import mongoose from "mongoose";
import { chromium, type Browser } from "playwright";
import { connectDB } from "@/lib/db/connect";
import { Hotel } from "@/lib/models/Hotel";
import { Room } from "@/lib/models/Room";
import { RoomInventory } from "@/lib/models/RoomInventory";
import { Vendor } from "@/lib/models/Vendor";
import { AuditLog } from "@/lib/models/AuditLog";
import { getNightRates, toNight } from "@/lib/services/inventory";

const BASE = process.env.CALENDAR_TEST_BASE ?? "http://localhost:3100";
const EMAIL = process.env.CALENDAR_TEST_EMAIL ?? "vendor@baybreeze.com";
const PASSWORD = process.env.CALENDAR_TEST_PASSWORD ?? "kemonasobabe";
const FIRST = "2030-01-10";
const SECOND = "2030-01-11";

async function main() {
  const hotelId = new mongoose.Types.ObjectId();
  const roomId = new mongoose.Types.ObjectId();
  let browser: Browser | undefined;
  try {
    await connectDB();
    const vendor = await Vendor.findOne({ contactEmail: EMAIL }).lean();
    assert(vendor, "Seed the vendor first or supply CALENDAR_TEST_EMAIL and CALENDAR_TEST_PASSWORD.");
    await Hotel.create({
      _id: hotelId, vendorId: vendor._id, name: "Calendar rate regression",
      slug: `calendar-rate-test-${hotelId}`, description: "Temporary calendar regression fixture.",
      address: "Temporary test address", city: "Dhaka", location: "Test location",
    });
    const room = await Room.create({
      _id: roomId, hotelId, vendorId: vendor._id, name: "Calendar test room",
      bedType: "1 King Bed", basePrice: 1000, totalUnits: 5,
    });
    browser = await chromium.launch();
    const page = await browser.newPage();
    page.setDefaultTimeout(20_000);
    await page.goto(`${BASE}/auth/login`);
    await page.locator('input[name="email"]').fill(EMAIL);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await Promise.all([
      page.waitForURL((url) => !url.pathname.startsWith("/auth/login")),
      page.locator('button[type="submit"]').click(),
    ]);
    const calendarUrl = `${BASE}/vendor/hotels/${hotelId}/calendar?room=${roomId}&start=${FIRST}`;
    const firstNight = page.getByRole("button", { name: /^Thursday,? 10 January/ });
    const firstRow = () => RoomInventory.findOne({ roomId, date: toNight(FIRST) }).lean();
    const secondRow = () => RoomInventory.findOne({ roomId, date: toNight(SECOND) }).lean();
    const assertNoCrash = async () => {
      assert.equal(await page.getByText("This section could not load", { exact: true }).count(), 0,
        await page.locator("body").innerText());
    };
    const save = async () => {
      await page.getByRole("button", { name: "Save night", exact: true }).click();
      await page.locator("#n-price").waitFor({ state: "detached" });
      await assertNoCrash();
    };

    await page.goto(calendarUrl);
    await firstNight.click();
    await page.locator("#n-price").fill("1800");
    await save();
    let row = await firstRow();
    assert(row);
    assert.equal(row.priceOverride, 1800);
    assert.equal(row.unitsTotal, 5);
    assert.equal(row.unitsBooked, 0);
    assert.equal(row.unitsHeld, 0);
    console.log("PASS price-only save creates inventory without crashing");

    await RoomInventory.updateOne({ _id: row._id }, { $set: { unitsBooked: 1, unitsHeld: 1 } });
    await page.reload();
    await firstNight.click();
    await page.locator("#n-price").fill("2200");
    await page.locator("#n-units").fill("4");
    await page.locator("#n-min").fill("2");
    await save();
    row = await firstRow();
    assert(row);
    assert.equal(row.priceOverride, 2200);
    assert.equal(row.unitsTotal, 4);
    assert.equal(row.minStay, 2);
    assert.equal(row.unitsBooked, 1);
    assert.equal(row.unitsHeld, 1);
    console.log("PASS existing-night edits preserve bookings and holds");

    await firstNight.click();
    await page.getByRole("button", { name: "Reset to base price", exact: true }).click();
    await page.locator("#n-price").waitFor({ state: "detached" });
    await assertNoCrash();
    assert.equal((await firstRow())?.priceOverride, null);
    console.log("PASS reset restores the room base price");

    const bulk = page.locator("form").filter({ has: page.locator("#bulk-from") });
    await bulk.locator("#bulk-from").fill(FIRST);
    await bulk.locator("#bulk-to").fill(SECOND);
    await bulk.locator("#bulk-price").fill("2500");
    await bulk.locator("#bulk-units").fill("3");
    await bulk.getByRole("button", { name: "Apply to range", exact: true }).click();
    await bulk.getByRole("status").waitFor();
    assert.match(await bulk.getByRole("status").innerText(), /Updated 2 nights/);
    await assertNoCrash();
    for (const inventory of [await firstRow(), await secondRow()]) {
      assert(inventory);
      assert.equal(inventory.priceOverride, 2500);
      assert.equal(inventory.unitsTotal, 3);
    }
    assert.equal((await firstRow())?.unitsBooked, 1);
    assert.equal((await firstRow())?.unitsHeld, 1);
    assert.equal((await secondRow())?.unitsBooked, 0);
    console.log("PASS bulk edits update existing nights and create missing nights");

    const prices = await getNightRates(room, toNight(FIRST), toNight("2030-01-12"));
    assert.deepEqual(prices.map((night) => night.price), [2500, 2500]);
    assert.deepEqual(prices.map((night) => night.unitsFree), [1, 3]);
    await page.reload();
    await firstNight.click();
    assert.equal(await page.locator("#n-price").inputValue(), "2500");
    assert.equal(await page.locator("#n-units").inputValue(), "3");
    console.log("PASS rates survive reload and feed live guest pricing");
  } finally {
    await browser?.close();
    if (mongoose.connection.readyState === 1) {
      await RoomInventory.deleteMany({ roomId });
      await Room.deleteOne({ _id: roomId });
      await Hotel.deleteOne({ _id: hotelId });
      await AuditLog.deleteMany({ entity: "Room", entityId: String(roomId) });
    }
    await mongoose.disconnect();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
