/** Browser regression against a running app and seeded vendor. Uses temporary records only.
 * Run: npx tsx scripts/test-room-photos.ts (ROOM_TEST_BASE defaults to localhost:3100).
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import assert from "node:assert/strict";
import mongoose from "mongoose";
import { chromium, type Browser, type Locator } from "playwright";
import { connectDB } from "@/lib/db/connect";
import { Hotel } from "@/lib/models/Hotel";
import { Room } from "@/lib/models/Room";
import { AuditLog } from "@/lib/models/AuditLog";
import { Vendor } from "@/lib/models/Vendor";
import { slugify } from "@/lib/cache/tags";
import { cdn } from "@/lib/utils/cdn";

const BASE = process.env.ROOM_TEST_BASE ?? "http://localhost:3100";
const EMAIL = process.env.ROOM_TEST_EMAIL ?? "vendor@baybreeze.com";
const PASSWORD = process.env.ROOM_TEST_PASSWORD ?? "kemonasobabe";

async function imageUrl(img: Locator) {
  const src = await img.getAttribute("src");
  assert(src);
  return new URL(src, BASE).searchParams.get("url") ?? src;
}

async function main() {
  let browser: Browser | undefined;
  const hotelId = new mongoose.Types.ObjectId();
  const roomId = new mongoose.Types.ObjectId();
  try {
    await connectDB();
    const vendor = await Vendor.findOne({ contactEmail: EMAIL }).lean();
    assert(vendor, "Seed the test vendor first, or set ROOM_TEST_EMAIL and ROOM_TEST_PASSWORD.");
    const source = await Hotel.findOne({ vendorId: vendor._id, "images.2": { $exists: true } }).lean();
    assert(source, "Test vendor needs a property with at least three photos.");
    const photos = source.images.slice(0, 3).map((img, i) => ({
      ...img, publicId: `room-photo-test-${roomId}-${i}`, alt: `Test photo ${i + 1}`,
    }));
    const hotel = await Hotel.create({
      _id: hotelId, vendorId: vendor._id, name: `Room photo test ${hotelId}`,
      slug: `room-photo-test-${hotelId}`, description: "Temporary room photo regression fixture. ".repeat(3),
      address: "Temporary test address", city: source.city, location: source.location,
      status: "published", images: photos, priceFrom: 1000,
    });
    const room = await Room.create({
      _id: roomId, hotelId, vendorId: vendor._id, name: "Photo regression room",
      bedType: "1 King Bed", basePrice: 1000, totalUnits: 1, images: photos,
      // Deliberately omit the optional size: photo-only saves must still work.
    });
    const vendorPath = `/vendor/hotels/${hotelId}/rooms`;
    const publicPath = `/hotels/${slugify(hotel.city)}/${hotel.slug}`;
    const roomPath = `${publicPath}/${room.slug}`;

    browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
    const page = await context.newPage();
    page.setDefaultTimeout(20_000);
    await page.goto(`${BASE}/auth/login`);
    await page.locator('input[name="email"]').fill(EMAIL);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await Promise.all([
      page.waitForURL((url) => !url.pathname.startsWith("/auth/login")),
      page.locator('button[type="submit"]').click(),
    ]);

    // Warm both public pages before editing, to exercise invalidation of old data.
    const guest = await browser.newPage();
    await guest.goto(`${BASE}${publicPath}`);
    await guest.getByRole("heading", { name: room.name, exact: true }).waitFor();
    assert.equal(await imageUrl(guest.getByAltText(room.name, { exact: true })), cdn(photos[0].url, 240, 180));
    await guest.goto(`${BASE}${roomPath}`);
    await guest.getByRole("region", { name: `${room.name} photos` }).waitFor();

    await page.goto(`${BASE}${vendorPath}`);
    await page.locator('button[title="Edit room"]').click();
    const form = page.locator("form").filter({ has: page.locator('input[name="roomId"]') });
    const order = async () => JSON.parse(await form.locator('input[name="images"]').inputValue())
      .map((img: { publicId: string }) => img.publicId);

    await page.setViewportSize({ width: 390, height: 844 });
    await form.getByRole("button", { name: "Make photo 3 the cover", exact: true }).click();
    await form.getByRole("button", { name: "Move photo 3 earlier", exact: true }).click();
    assert.deepEqual(await order(), [photos[2].publicId, photos[1].publicId, photos[0].publicId]);
    console.log("PASS mobile cover selection and arrow reordering update the submitted photos");

    // Exercise real drag events after moving the cover, including drag cleanup.
    await page.setViewportSize({ width: 1200, height: 900 });
    const tiles = form.locator("[draggable=true]");
    await tiles.nth(2).dragTo(tiles.nth(1));
    const expected = [photos[2], photos[0], photos[1]];
    assert.deepEqual(await order(), expected.map((img) => img.publicId));
    console.log("PASS drag reordering preserves photo identities");

    await form.locator('input[name="name"]').fill("R");
    await form.getByRole("button", { name: "Save room", exact: true }).click();
    await form.getByRole("status").waitFor();
    assert.match(await form.getByRole("status").innerText(), /Room name is required/);
    assert.deepEqual(await order(), expected.map((img) => img.publicId));
    assert.deepEqual((await Room.findById(roomId).lean())?.images.map((img) => img.publicId), photos.map((img) => img.publicId));
    console.log("PASS validation errors keep the editor and unsaved photo order visible");

    await form.locator('input[name="name"]').fill(room.name);
    let release!: () => void;
    let started!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const requestStarted = new Promise<void>((resolve) => { started = resolve; });
    await page.route(`**${vendorPath}`, async (route) => {
      if (route.request().method() === "POST" && route.request().headers()["next-action"]) {
        started();
        await gate;
      }
      await route.continue();
    });
    await form.getByRole("button", { name: "Save room", exact: true }).click();
    await requestStarted;
    try {
      assert(await form.isVisible());
      assert(await form.getByRole("button", { name: "Saving...", exact: true }).isDisabled());
    } finally {
      release();
    }
    await form.waitFor({ state: "detached" });
    assert.deepEqual((await Room.findById(roomId).lean())?.images.map((img) => img.publicId), expected.map((img) => img.publicId));
    assert.equal(await imageUrl(page.locator("li").filter({ hasText: room.name }).locator("img")), expected[0].url);
    console.log("PASS editor waits for persistence and refreshes the vendor cover");

    await page.reload();
    await page.locator('button[title="Edit room"]').click();
    assert.deepEqual(await order(), expected.map((img) => img.publicId));
    console.log("PASS cover and order survive reload and reopening the editor");

    await guest.goto(`${BASE}${publicPath}`);
    await guest.getByRole("heading", { name: room.name, exact: true }).waitFor();
    assert.equal(await imageUrl(guest.getByAltText(room.name, { exact: true })), cdn(expected[0].url, 240, 180));
    await guest.goto(`${BASE}${roomPath}`);
    const gallery = guest.getByRole("region", { name: `${room.name} photos` });
    await gallery.waitFor();
    for (let i = 0; i < expected.length; i++) {
      assert.equal(await imageUrl(gallery.locator("img").nth(i)), cdn(expected[i].url, 800, 534));
    }
    assert.equal(await guest.locator('meta[property="og:image"]').getAttribute("content"), expected[0].url);
    console.log("PASS cached public room card, gallery and sharing image use the saved cover and order");
  } finally {
    await browser?.close();
    if (mongoose.connection.readyState === 1) {
      await Room.deleteOne({ _id: roomId });
      await Hotel.deleteOne({ _id: hotelId });
      await AuditLog.deleteMany({ entity: "Room", entityId: String(roomId) });
    }
    await mongoose.disconnect();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
