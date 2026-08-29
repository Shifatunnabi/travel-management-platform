/**
 * Drives a real browser through the app and saves screenshots to ./shots.
 * Signs in through the actual login form, so what is captured is what a
 * customer or partner would really see, hydration and streaming included.
 *
 *   npm run shots
 */
import { chromium, type Page } from "playwright";
import fs from "node:fs";

const BASE = process.env.SHOT_BASE ?? "http://localhost:3100";
const PASSWORD = process.env.SHOT_PASSWORD ?? "kemonasobabe";
const OUT = "shots";

interface Shot {
  name: string;
  path: string;
  full?: boolean;
  /** Wait for this text before capturing, so streamed content has landed. */
  waitFor?: string;
}

const PUBLIC: Shot[] = [
  { name: "01-home", path: "/", full: true, waitFor: "Popular Hotels" },
  { name: "02-search", path: "/hotels/search?destination=Cox", full: true, waitFor: "per night from" },
  { name: "03-hotel", path: "/hotels/coxs-bazar/the-peninsula-cox-s-bazar", full: true, waitFor: "Choose a room" },
  { name: "04-login", path: "/auth/login" },
];

const CUSTOMER: Shot[] = [
  { name: "05-account", path: "/account", full: true, waitFor: "Welcome back" },
  { name: "06-bookings", path: "/account/bookings?filter=past", full: true, waitFor: "My bookings" },
  { name: "07-profile", path: "/account/profile", full: true, waitFor: "Your details" },
];

const VENDOR: Shot[] = [
  { name: "08-vendor-dashboard", path: "/vendor", full: true, waitFor: "Arrivals today" },
  { name: "09-vendor-hotels", path: "/vendor/hotels", full: true, waitFor: "Properties" },
  { name: "10-vendor-rooms", path: "__ROOMS__", full: true, waitFor: "Room types" },
  { name: "11-vendor-calendar", path: "__CALENDAR__", full: true, waitFor: "Bulk edit" },
  { name: "12-vendor-bookings", path: "/vendor/bookings?filter=completed", full: true, waitFor: "Bookings" },
  { name: "13-vendor-reviews", path: "/vendor/reviews", full: true, waitFor: "Reviews" },
  { name: "14-vendor-finance", path: "/vendor/finance", full: true, waitFor: "Available now" },
];

async function signIn(page: Page, email: string) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PASSWORD);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/auth/login"), { timeout: 20_000 }),
    page.click('button[type="submit"]'),
  ]);
}

async function capture(page: Page, shot: Shot) {
  await page.goto(`${BASE}${shot.path}`, { waitUntil: "domcontentloaded" });
  if (shot.waitFor) {
    try {
      await page.getByText(shot.waitFor, { exact: false }).first().waitFor({ timeout: 15_000 });
    } catch {
      console.log(`    (did not find "${shot.waitFor}" — capturing anyway)`);
    }
  }
  await page.waitForTimeout(900); // let images settle
  await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: shot.full ?? false });

  // Report whether any Suspense fallback is still on screen.
  const stuck = await page.locator(".animate-pulse").count();
  const text = (await page.locator("body").innerText()).replace(/\s+/g, " ").trim();
  console.log(
    `  ${shot.name.padEnd(24)} ${String(text.length).padStart(5)} chars` +
      (stuck ? `  ⚠ ${stuck} skeleton(s) still showing` : "  ✓"),
  );
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const errors: string[] = [];

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`${page.url().replace(BASE, "")} — ${m.text().slice(0, 140)}`);
  });
  page.on("pageerror", (e) => errors.push(`${page.url().replace(BASE, "")} — ${e.message.slice(0, 140)}`));

  console.log("\nPublic");
  for (const shot of PUBLIC) await capture(page, shot);

  console.log("\nCustomer (farhan@example.com)");
  await signIn(page, "farhan@example.com");
  for (const shot of CUSTOMER) await capture(page, shot);

  console.log("\nVendor admin (vendor@baybreeze.com)");
  await context.clearCookies();
  await signIn(page, "vendor@baybreeze.com");

  // Resolve the hotel-scoped routes from the vendor's own property list.
  await page.goto(`${BASE}/vendor/hotels`, { waitUntil: "domcontentloaded" });
  await page.getByText("Properties").first().waitFor({ timeout: 15_000 });
  const editHref = await page.locator('a[href*="/vendor/hotels/"][href$="/edit"]').first().getAttribute("href");
  const hotelId = editHref?.split("/")[3] ?? "";

  for (const shot of VENDOR) {
    const resolved: Shot = {
      ...shot,
      path: shot.path
        .replace("__ROOMS__", `/vendor/hotels/${hotelId}/rooms`)
        .replace("__CALENDAR__", `/vendor/hotels/${hotelId}/calendar`),
    };
    await capture(page, resolved);
  }

  await browser.close();

  console.log(`\n${fs.readdirSync(OUT).length} screenshots in ./${OUT}`);
  if (errors.length) {
    console.log(`\n${errors.length} console error(s):`);
    for (const e of [...new Set(errors)].slice(0, 12)) console.log(`  ${e}`);
  } else {
    console.log("No console errors on any page.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
