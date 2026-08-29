/**
 * Rebuilds the database with realistic data: platform staff, two vendors,
 * five hotels with rooms and a month of priced inventory, customers, past
 * bookings, and published reviews.
 *
 *   npm run seed         → wipe and reseed
 *   npm run seed -- --keep-users
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import mongoose, { type HydratedDocument } from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import {
  type IVendor,
  AuditLog, Booking, Coupon, EmailLog, Hotel, LedgerEntry, Payment, Payout,
  Review, Room, RoomInventory, Settings, User, Vendor, VendorMember,
  generateBookingRef, deriveDisplayRating, SETTINGS_DEFAULTS,
} from "@/lib/models";
import { slugify } from "@/lib/cache/tags";
import { v2 as cloudinary } from "cloudinary";

const ROUNDS = 10;
/** Price delta on the cheapest seeded rate plan. */
const SAVER_DELTA = -800;

/** Absolute URLs where a property supplied its own photos, Unsplash otherwise. */
function hotelImages(spec: { imageUrls?: string[]; images: string[] }): string[] {
  if (spec.imageUrls?.length) return spec.imageUrls;
  return spec.images.map((id) => `https://images.unsplash.com/${id}?w=1200&q=80`);
}

/**
 * Copies a property's own photography into Cloudinary — the same store the
 * vendor panel uploads to. Hotlinking the source site is not viable: Next's
 * image optimizer times out fetching from it, and it puts our traffic on
 * someone else's bandwidth.
 *
 * Idempotent: a fixed public_id means re-seeding reuses what is already there.
 */
const uploadCache = new Map<string, string>();

async function toCloudinary(url: string, publicId: string): Promise<string> {
  if (!url.startsWith("http") || url.includes("res.cloudinary.com")) return url;
  const cached = uploadCache.get(publicId);
  if (cached) return cached;

  try {
    const result = await cloudinary.uploader.upload(url, {
      public_id: publicId,
      overwrite: false,
      resource_type: "image",
      transformation: [{ width: 1600, crop: "limit", quality: "auto" }],
    });
    uploadCache.set(publicId, result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.warn(`  ! could not copy ${publicId}: ${(error as Error).message}`);
    return url;
  }
}
const hash = (p: string) => bcrypt.hash(p, ROUNDS);
const day = (offset: number) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
};

interface SeedRoom {
  name: string;
  price: number;
  units: number;
  bed: string;
  size: number;
  adults: number;
  children: number;
  /** Absolute URL when the property supplied its own room photo. */
  image?: string;
}

interface SeedHotel {
  name: string;
  city: string;
  star: number;
  vendor: number;
  location: string;
  address: string;
  description: string;
  amenities: string[];
  tags: string[];
  distance: number;
  /** Unsplash photo ids, used when the property has no imagery of its own. */
  images: string[];
  /** Absolute URLs, taking precedence over `images`. */
  imageUrls?: string[];
  checkIn?: string;
  checkOut?: string;
  rooms: SeedRoom[];
}

const HOTELS: SeedHotel[] = [
  {
    name: "The Peninsula Cox's Bazar", city: "Cox's Bazar", star: 5, vendor: 0,
    location: "Kolatoli Beach, Cox's Bazar", address: "Kolatoli Beach Road, Cox's Bazar",
    description: "Beachfront luxury where the world's longest natural sandy beach meets attentive service. Rooftop infinity pool, three restaurants, and uninterrupted views of the Bay of Bengal from every sea-facing room.",
    amenities: ["Free WiFi", "Infinity Pool", "Spa", "Restaurant", "Beach Access", "Gym", "Room Service", "Airport Shuttle"],
    tags: ["Beachfront", "Luxury", "Pool"], distance: 0.8,
    images: ["photo-1566073771259-6a8506099945", "photo-1571003123894-1f0594d2b5d9", "photo-1520250497591-112f2f40a3f4", "photo-1551882547-ff40c63fe5fa"],
    rooms: [
      { name: "Superior Sea View", price: 12500, units: 14, bed: "1 King Bed", size: 32, adults: 2, children: 1 },
      { name: "Deluxe Balcony Suite", price: 18500, units: 6, bed: "1 King Bed + Sofa", size: 48, adults: 3, children: 1 },
      { name: "Family Room", price: 16000, units: 8, bed: "2 Queen Beds", size: 44, adults: 4, children: 2 },
    ],
  },
  {
    name: "Long Beach Hotel", city: "Cox's Bazar", star: 4, vendor: 0,
    location: "Hotel Zone, Cox's Bazar", address: "Hotel Motel Zone, Cox's Bazar",
    description: "A comfortable, well-run hotel a two-minute walk from the beach. Popular with families for its large rooms, generous breakfast buffet, and a pool that stays open late.",
    amenities: ["Free WiFi", "Swimming Pool", "Restaurant", "Sea View", "Parking", "Room Service"],
    tags: ["Sea View", "Family Friendly"], distance: 1.2,
    images: ["photo-1542314831-068cd1dbfeeb", "photo-1445019980597-93fa8acb246c", "photo-1584132967334-10e028bd69f7"],
    rooms: [
      { name: "Standard Twin", price: 6800, units: 20, bed: "2 Single Beds", size: 26, adults: 2, children: 1 },
      { name: "Premium Sea View", price: 9200, units: 10, bed: "1 Queen Bed", size: 34, adults: 2, children: 2 },
    ],
  },
  {
    name: "Royal Tulip Sea Pearl Beach Resort", city: "Cox's Bazar", star: 5, vendor: 1,
    location: "Inani Beach, Cox's Bazar", address: "Inani Beach, Ukhia, Cox's Bazar",
    description: "A full resort on a quiet stretch of Inani Beach, twenty minutes from town. Two pools, five restaurants, a kids' club, and a private beach that never feels crowded.",
    amenities: ["Free WiFi", "Private Beach", "2 Pools", "Spa", "5 Restaurants", "Kids Club", "Gym", "Tennis Court"],
    tags: ["Resort", "Private Beach", "Kids Club"], distance: 2.5,
    images: ["photo-1578683010236-d716f9a3f461", "photo-1586611292717-f828b167408c", "photo-1582719478250-c89cae4dc85b"],
    rooms: [
      { name: "Deluxe Garden View", price: 11000, units: 24, bed: "1 King Bed", size: 36, adults: 2, children: 2 },
      { name: "Premier Ocean View", price: 15000, units: 16, bed: "1 King Bed", size: 42, adults: 2, children: 2 },
      { name: "Two-Bedroom Villa", price: 32000, units: 4, bed: "2 King Beds", size: 96, adults: 6, children: 3 },
    ],
  },
  {
    name: "Amari Dhaka", city: "Dhaka", star: 5, vendor: 1,
    location: "Gulshan 2, Dhaka", address: "47 Road 41, Gulshan 2, Dhaka 1212",
    description: "A business hotel in the middle of Gulshan's diplomatic zone. Quiet rooms with proper desks, a lap pool on the seventh floor, and breakfast that starts at six for early flights.",
    amenities: ["Free WiFi", "Business Centre", "Swimming Pool", "Gym", "Restaurant", "Airport Shuttle", "Laundry"],
    tags: ["Business", "City Centre"], distance: 0.4,
    images: ["photo-1611892440504-42a792e24d32", "photo-1590490360182-c33d57733427", "photo-1631049307264-da0ec9d70304"],
    rooms: [
      { name: "Deluxe King", price: 14500, units: 30, bed: "1 King Bed", size: 34, adults: 2, children: 1 },
      { name: "Executive Suite", price: 24000, units: 8, bed: "1 King Bed + Living Room", size: 62, adults: 3, children: 2 },
    ],
  },
  {
    name: "Nazimgarh Garden Resort", city: "Sylhet", star: 4, vendor: 1,
    location: "Khadimnagar, Sylhet", address: "Khadimnagar National Park Road, Sylhet",
    description: "Set among tea gardens on the edge of Khadimnagar. Cottages with private verandas, a restaurant that cooks what the kitchen garden produces, and guided walks into the tea estate at dawn.",
    amenities: ["Free WiFi", "Garden", "Restaurant", "Tea Garden Tours", "Parking", "Airport Shuttle"],
    tags: ["Nature", "Tea Garden", "Quiet"], distance: 8.5,
    images: ["photo-1520250497591-112f2f40a3f4", "photo-1618773928121-c32242e63f39", "photo-1596436889106-be35e843f974"],
    rooms: [
      { name: "Garden Cottage", price: 7500, units: 12, bed: "1 Queen Bed", size: 30, adults: 2, children: 1 },
      { name: "Tea View Suite", price: 11500, units: 6, bed: "1 King Bed", size: 46, adults: 3, children: 2 },
    ],
  },

  /**
   * Hotel Prime Park — a real property, seeded from its own public website
   * (hotelprimepark.com) on 29 Aug 2026. Name, address, contacts, room types,
   * sizes, bed configurations, occupancy, amenities and check-in times are all
   * as published there.
   *
   * The site does not publish nightly rates or how many of each room exist, so
   * `price` and `units` below are PLACEHOLDERS scaled by room size. The vendor
   * corrects them in Rates & availability before going live.
   */
  {
    name: "Hotel Prime Park", city: "Cox's Bazar", star: 4, vendor: 2,
    location: "Kolatoli, Hotel Motel Zone, Cox's Bazar",
    address: "Plot 58, Block C, Kolatoli, Hotel Motel Zone, Cox's Bazar",
    description:
      "A beachside hotel in the heart of Cox's Bazar, moments from the world's longest sea beach. Prime Park pairs comfort and serenity with coastal charm — spacious suites with wooden floors, a restaurant and juice bar on site, and airport pick-up arranged on request.",
    amenities: [
      "Free WiFi", "Airport Shuttle", "Restaurant", "Juice Bar", "Room Service",
      "Housekeeping", "Laundry", "In-room Breakfast", "Event Facilities",
    ],
    tags: ["Beachside", "Suites", "Family Friendly"], distance: 0.6,
    checkIn: "12:00", checkOut: "11:00",
    imageUrls: [
      "https://hotelprimepark.com/wp-content/uploads/2025/11/FIZ00045-HDR-1-scaled.jpg",
      "https://hotelprimepark.com/wp-content/uploads/2025/11/DSC09290-HDR-scaled.jpeg",
      "https://hotelprimepark.com/wp-content/uploads/2025/11/FIZ00093-HDR-scaled.jpg",
      "https://hotelprimepark.com/wp-content/uploads/2025/11/FIZ00114-HDR-scaled.jpg",
      "https://hotelprimepark.com/wp-content/uploads/2025/11/FIZ00144-HDR-scaled.jpg",
      "https://hotelprimepark.com/wp-content/uploads/2025/11/FIZ00005-1-scaled.jpg",
    ],
    images: [],
    rooms: [
      { name: "Couple Premium Room", price: 7500, units: 12, bed: "1 King Bed", size: 28, adults: 2, children: 1,
        image: "https://hotelprimepark.com/wp-content/uploads/2025/11/FIZ08962-HDR-1-scaled.jpeg" },
      { name: "Twin Premium Room", price: 7500, units: 10, bed: "2 Single Beds", size: 28, adults: 2, children: 1,
        image: "https://hotelprimepark.com/wp-content/uploads/2025/11/FIZ09128-HDR-1-scaled.jpeg" },
      { name: "Superior Premium Room", price: 9500, units: 8, bed: "2 King Size Beds", size: 30.2, adults: 4, children: 1,
        image: "https://hotelprimepark.com/wp-content/uploads/2025/11/FIZ09320-HDR-scaled.jpeg" },
      { name: "Honeymoon Suite", price: 14000, units: 3, bed: "1 Bed · wooden floor", size: 74.3, adults: 2, children: 0,
        image: "https://hotelprimepark.com/wp-content/uploads/2025/11/download-6-scaled.png" },
      { name: "Executive Premium Suite", price: 15000, units: 4, bed: "2 King Size Beds · 2 connected rooms", size: 74.3, adults: 4, children: 2,
        image: "https://hotelprimepark.com/wp-content/uploads/2025/11/IMG_7856-scaled.jpg" },
      { name: "Royal Club Suite", price: 16500, units: 2, bed: "2 King Size Beds · 2 connected rooms", size: 74.3, adults: 4, children: 2,
        image: "https://hotelprimepark.com/wp-content/uploads/2025/11/FIZ00397-HDR_compressed_1.jpg" },
    ],
  },
];

const REVIEW_TEXTS = [
  { r: 5, t: "Exactly as advertised", b: "Room was spotless, the sea view was real and not a marketing angle, and check-in took three minutes. Breakfast had proper local options alongside the usual continental spread." },
  { r: 4, t: "Very good, minor niggles", b: "Staff were genuinely helpful and the location is hard to beat. Air conditioning in our room was noisy on the first night; they moved us without any fuss." },
  { r: 5, t: "Worth every taka", b: "Took the family for a long weekend. The kids barely left the pool. Restaurant prices are fair for a property of this standard." },
  { r: 4, t: "Great stay, book a higher floor", b: "Lower floors catch road noise in the evening. Ask for something above the fifth and it is very quiet." },
  { r: 3, t: "Fine but nothing special", b: "Clean and well located, but the room felt dated compared to the photos. Breakfast was repetitive across three days." },
  { r: 5, t: "Best service I have had in Bangladesh", b: "Front desk remembered our names, arranged a car at short notice, and sorted a late checkout without being asked twice." },
];

async function main() {
  const keepUsers = process.argv.includes("--keep-users");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  await connectDB();
  console.log("→ connected to", mongoose.connection.name);

  // Heterogeneous models: only deleteMany is called, so a structural shape
  // avoids fighting Mongoose's deeply generic Model type.
  type Clearable = { deleteMany(filter: Record<string, never>): { exec(): Promise<unknown> } };
  const collections = [Hotel, Room, RoomInventory, Booking, Payment, Review, LedgerEntry, Payout, Coupon, AuditLog, EmailLog, Vendor, VendorMember, Settings];
  for (const model of collections as unknown as Clearable[]) await model.deleteMany({}).exec();
  if (!keepUsers) await User.deleteMany({});
  console.log("→ cleared collections");

  await Settings.create({ key: "global", ...SETTINGS_DEFAULTS });

  // ── platform staff ────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_PLATFORM_ADMIN_EMAIL || "admin@tofiza.com";
  const adminPassword = process.env.SEED_PLATFORM_ADMIN_PASSWORD || "Admin1234";
  const passwordHash = await hash(adminPassword);

  const staff = await User.create([
    { name: "Platform Owner", email: adminEmail, passwordHash, role: "platform", platformRole: "super_admin", emailVerifiedAt: new Date(), phone: "+8801700000001" },
    { name: "Ops Manager", email: "ops@tofiza.com", passwordHash, role: "platform", platformRole: "ops", emailVerifiedAt: new Date(), phone: "+8801700000002" },
    { name: "Finance Officer", email: "finance@tofiza.com", passwordHash, role: "platform", platformRole: "finance", emailVerifiedAt: new Date(), phone: "+8801700000003" },
  ]);
  console.log(`→ platform staff: ${staff.map((s) => s.email).join(", ")}`);

  // ── vendors ───────────────────────────────────────────────────────────────
  const vendorSpecs = [
    { business: "Bay Breeze Hospitality", email: "vendor@baybreeze.com", owner: "Rashed Karim", city: "Cox's Bazar", commission: null, phone: undefined as string | undefined },
    { business: "Seagull Group of Hotels", email: "vendor@seagullgroup.com", owner: "Nusrat Jahan", city: "Dhaka", commission: 12 },
    { business: "Hotel Prime Park", email: "vendor@primeparkbd.com", owner: "Prime Park Management", city: "Cox's Bazar", commission: null, phone: "+8801775609915" },
  ];

  const vendors: HydratedDocument<IVendor>[] = [];
  for (const spec of vendorSpecs) {
    const ownerUser = await User.create({
      name: spec.owner, email: spec.email, passwordHash, role: "vendor",
      emailVerifiedAt: new Date(), phone: "+88017100000" + vendors.length,
    });
    const vendor = await Vendor.create({
      ownerUserId: ownerUser._id,
      businessName: spec.business,
      slug: slugify(spec.business),
      contactEmail: spec.email,
      contactPhone: spec.phone ?? "+8801710000000",
      address: `${spec.city}, Bangladesh`,
      city: spec.city,
      tradeLicenceNo: "TRAD/DNCC/" + (100000 + vendors.length),
      tin: "1234567890" + vendors.length,
      commissionPct: spec.commission,
      status: "approved",
      bank: {
        accountName: spec.business, accountNumber: "1502" + (10000000 + vendors.length),
        bankName: "BRAC Bank", branch: "Gulshan", routingNumber: "060270435",
        verified: true, verifiedAt: new Date(),
      },
      moderation: { reviewedBy: staff[0]._id, note: "Documents verified.", at: new Date() },
    });
    await VendorMember.create({ vendorId: vendor._id, userId: ownerUser._id, role: "owner" });
    vendors.push(vendor);
  }
  console.log(`→ vendors: ${vendors.map((v) => v.businessName).join(", ")}`);

  // ── customers ─────────────────────────────────────────────────────────────
  const customers = await User.create(
    ["Farhan Ahmed", "Tasnim Rahman", "Imran Hossain", "Sadia Islam", "Rifat Chowdhury"].map((name, i) => ({
      name,
      email: `${name.split(" ")[0].toLowerCase()}@example.com`,
      passwordHash,
      role: "customer" as const,
      phone: `+88018${String(10000000 + i)}`,
      emailVerifiedAt: i < 4 ? new Date() : null,
    })),
  );
  console.log(`→ customers: ${customers.length}`);

  // ── hotels, rooms, inventory ──────────────────────────────────────────────
  const createdHotels = [];
  const folder = `${process.env.CLOUDINARY_FOLDER ?? "tofiza"}/seed`;

  for (const spec of HOTELS) {
    const vendor = vendors[spec.vendor];
    const hotel = await Hotel.create({
      vendorId: vendor._id,
      name: spec.name,
      slug: slugify(spec.name),
      description: spec.description,
      propertyType: spec.name.includes("Resort") ? "resort" : "hotel",
      starCategory: spec.star,
      address: spec.address,
      city: spec.city,
      country: "Bangladesh",
      location: spec.location,
      distanceFromCenter: spec.distance,
      images: await Promise.all(
        hotelImages(spec).map(async (url, i) => {
          const publicId = `${folder}/${slugify(spec.name)}-${i + 1}`;
          return {
            publicId,
            url: spec.imageUrls?.length ? await toCloudinary(url, publicId) : url,
            width: 1200, height: 800,
            alt: `${spec.name} — photo ${i + 1}`,
          };
        }),
      ),
      amenities: spec.amenities,
      tags: spec.tags,
      status: "published",
      ...(spec.checkIn
        ? { policies: { checkInTime: spec.checkIn, checkOutTime: spec.checkOut, cancellationHours: 24, childrenAllowed: true, petsAllowed: false } }
        : {}),
      moderation: { reviewedBy: staff[1]._id, note: "Approved.", at: new Date() },
      // Matches refreshPriceFrom(): the cheapest rate plan, not the base price.
      priceFrom: Math.min(...spec.rooms.map((r) => r.price)) + SAVER_DELTA,
    });

    for (const r of spec.rooms) {
      const room = await Room.create({
        hotelId: hotel._id, vendorId: vendor._id,
        name: r.name,
        description: `${r.bed} · ${r.size} sqm · sleeps ${r.adults} adults`,
        bedType: r.bed, sizeSqm: r.size, maxAdults: r.adults, maxChildren: r.children,
        basePrice: r.price, totalUnits: r.units,
        amenities: ["Air Conditioning", "Free WiFi", "Flat-screen TV", "Mini-bar", "Safe"],
        images: await Promise.all(
          (r.image ? [r.image] : hotelImages(spec).slice(0, 2)).map(async (url, i) => {
            const publicId = `${folder}/${slugify(spec.name)}-${slugify(r.name)}-${i + 1}`;
            return {
              publicId,
              url: r.image ? await toCloudinary(url, publicId) : url,
              width: 900, height: 600, alt: r.name,
            };
          }),
        ),
        ratePlans: [
          { code: "room-only", name: "Room Only", breakfast: false, refundable: true, priceDelta: 0, cancellationHours: 24 },
          { code: "breakfast", name: "Bed & Breakfast", breakfast: true, refundable: true, priceDelta: 900, cancellationHours: 24 },
          { code: "saver", name: "Non-refundable Saver", breakfast: false, refundable: false, priceDelta: -800, cancellationHours: 0 },
        ],
      });

      // 60 nights of inventory, with weekend uplift
      const rows = [];
      for (let d = 0; d < 60; d++) {
        const date = day(d);
        const weekday = date.getUTCDay();
        const weekend = weekday === 5 || weekday === 6;
        rows.push({
          roomId: room._id, hotelId: hotel._id, date,
          unitsTotal: r.units, unitsBooked: 0, unitsHeld: 0,
          priceOverride: weekend ? Math.round(r.price * 1.15) : null,
          closed: false, minStay: weekend ? 2 : 1,
        });
      }
      await RoomInventory.insertMany(rows);
    }
    createdHotels.push(hotel);
  }
  console.log(`→ hotels: ${createdHotels.length}, rooms + 60 nights of inventory each`);

  // ── completed bookings + reviews ──────────────────────────────────────────
  const settings = SETTINGS_DEFAULTS;
  let bookingCount = 0;
  let reviewCount = 0;

  for (const hotel of createdHotels) {
    const rooms = await Room.find({ hotelId: hotel._id });
    const vendor = vendors.find((v) => String(v._id) === String(hotel.vendorId))!;
    const commissionPct = vendor.commissionPct ?? settings.defaultCommissionPct;

    for (let i = 0; i < 4; i++) {
      const room = rooms[i % rooms.length];
      const customer = customers[(i + bookingCount) % customers.length];
      const nights = 2 + (i % 2);
      const checkIn = day(-30 + i * 5);
      const checkOut = day(-30 + i * 5 + nights);
      const plan = room.ratePlans[i % room.ratePlans.length];
      const nightly = room.basePrice + plan.priceDelta;
      const roomTotal = nightly * nights;
      const taxes = Math.round(roomTotal * (settings.taxPct / 100));
      const grandTotal = roomTotal + taxes;
      const commissionAmount = Math.round((grandTotal * commissionPct) / 100);

      const booking = await Booking.create({
        ref: generateBookingRef(),
        customerId: customer._id, hotelId: hotel._id, vendorId: vendor._id,
        roomId: room._id, ratePlanCode: plan.code,
        snapshot: {
          hotelName: hotel.name, hotelSlug: hotel.slug, hotelCity: hotel.city,
          hotelAddress: hotel.address, hotelImage: hotel.images[0]?.url,
          roomName: room.name, ratePlanName: plan.name,
          breakfast: plan.breakfast, refundable: plan.refundable,
          cancellationHours: plan.cancellationHours,
        },
        checkIn, checkOut, nights, units: 1,
        guests: { adults: 2, children: 0 },
        guestDetails: { fullName: customer.name, email: customer.email, phone: customer.phone ?? "" },
        pricing: {
          nightlyRates: Array.from({ length: nights }, (_, n) => ({ date: day(-30 + i * 5 + n), price: nightly })),
          roomTotal, taxes, serviceFee: 0, discount: 0, couponCode: null,
          grandTotal, currency: "BDT",
          commissionPct, commissionAmount, vendorEarning: grandTotal - commissionAmount,
        },
        status: "completed",
        timeline: [
          { status: "pending_payment", at: day(-35 + i * 5) },
          { status: "confirmed", at: day(-35 + i * 5) },
          { status: "checked_in", at: checkIn },
          { status: "completed", at: checkOut },
        ],
      });

      await Payment.create({
        bookingId: booking._id, tranId: `SEED-${booking.ref}`,
        amount: grandTotal, currency: "BDT", status: "success",
        valId: `seedval-${booking.ref}`, validatedAt: checkIn,
      });

      const availableAt = new Date(checkOut);
      availableAt.setUTCDate(availableAt.getUTCDate() + settings.settlementDays);
      await LedgerEntry.create([
        { vendorId: vendor._id, bookingId: booking._id, type: "earning", amount: grandTotal - commissionAmount, availableAt, note: `Booking ${booking.ref}` },
        { vendorId: vendor._id, bookingId: booking._id, type: "commission", amount: -commissionAmount, availableAt, note: `Platform commission ${commissionPct}%` },
      ]);
      bookingCount++;

      // three of every four completed stays leave a review
      if (i < 3) {
        const t = REVIEW_TEXTS[(bookingCount + i) % REVIEW_TEXTS.length];
        await Review.create({
          hotelId: hotel._id, vendorId: vendor._id, bookingId: booking._id,
          customerId: customer._id, authorName: customer.name,
          rating: t.r, title: t.t, body: t.b, tripType: i % 2 ? "Family" : "Couple",
          status: "published",
        });
        booking.reviewedAt = new Date();
        await booking.save();
        reviewCount++;
      }
    }

    // recompute rating from the reviews just written
    const published = await Review.find({ hotelId: hotel._id, status: "published" }).select("rating");
    const sum = published.reduce((acc, r) => acc + r.rating, 0);
    const count = published.length;
    hotel.reviewStats = { count, sum, avg: count ? Math.round((sum / count) * 100) / 100 : 0 };
    Object.assign(hotel, deriveDisplayRating(hotel));
    await hotel.save();
  }
  console.log(`→ bookings: ${bookingCount}, reviews: ${reviewCount}`);

  // ── a coupon and a pending payout, so the admin queues are not empty ──────
  await Coupon.create({
    code: "TOFIZA500", description: "৳500 off stays over ৳10,000",
    scope: "platform", type: "fixed", value: 500, minSpend: 10000,
    usageLimit: 500, perUserLimit: 1, validFrom: day(-7), validTo: day(60),
    appliesTo: { hotelIds: [], cities: [] }, status: "active", createdBy: staff[0]._id,
  });

  const payoutVendor = vendors[0];
  await Payout.create({
    vendorId: payoutVendor._id, requestedAmount: 45000, currency: "BDT",
    status: "requested", bankSnapshot: payoutVendor.bank,
    requestedBy: payoutVendor.ownerUserId,
    timeline: [{ status: "requested", at: new Date(), by: payoutVendor.ownerUserId }],
  });

  console.log("\n✓ Seed complete\n");
  console.log("  Platform admin :", adminEmail, "/", adminPassword);
  console.log("  Vendor owner   : vendor@baybreeze.com /", adminPassword);
  console.log("  Prime Park     : vendor@primeparkbd.com /", adminPassword);
  console.log("  Customer       : farhan@example.com /", adminPassword);
  await mongoose.disconnect();
}

main().catch((e) => { console.error("Seed failed:", e); process.exit(1); });
