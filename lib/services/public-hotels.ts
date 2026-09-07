import { cacheLife, cacheTag } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Hotel } from "@/lib/models/Hotel";
import { Room } from "@/lib/models/Room";
import { Review } from "@/lib/models/Review";
import { tags } from "@/lib/cache/tags";
import type { PricingMode } from "@/lib/models/Room";
import { checkAvailability, countNights, toNight } from "./inventory";
import { occupancyFor, resolveRoom } from "./room-pricing";

export interface HotelCardData {
  id: string;
  name: string;
  slug: string;
  city: string;
  location: string;
  description: string;
  image?: string;
  images: string[];
  amenities: string[];
  tags: string[];
  starCategory: number;
  displayRating: number;
  displayReviewCount: number;
  priceFrom: number;
  currency: string;
  distanceFromCenter?: number;
  freeCancellation: boolean;
  breakfast: boolean;
}

function toCard(doc: unknown): HotelCardData {
  const h = doc as Record<string, unknown>;
  const images = (h.images as { url: string }[] | undefined) ?? [];
  return {
    id: String(h._id),
    name: h.name as string,
    slug: h.slug as string,
    city: h.city as string,
    location: h.location as string,
    description: h.description as string,
    image: images[0]?.url,
    images: images.map((i) => i.url),
    amenities: (h.amenities as string[]) ?? [],
    tags: (h.tags as string[]) ?? [],
    starCategory: (h.starCategory as number) ?? 3,
    displayRating: (h.displayRating as number) ?? 0,
    displayReviewCount: (h.displayReviewCount as number) ?? 0,
    priceFrom: (h.priceFrom as number) ?? 0,
    currency: (h.currency as string) ?? "BDT",
    distanceFromCenter: h.distanceFromCenter as number | undefined,
    freeCancellation: Boolean((h.policies as { cancellationHours?: number })?.cancellationHours),
    breakfast: Boolean(h.breakfast),
  };
}

const CARD_FIELDS =
  "name slug city location description images amenities tags starCategory displayRating displayReviewCount priceFrom currency distanceFromCenter policies featured listingPriority";

/** Cities with at least one live property, for the search form. */
export async function getDestinationCities(): Promise<{ city: string; count: number; from: number }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.hotels());

  await connectDB();
  const rows = await Hotel.aggregate<{ _id: string; count: number; from: number }>([
    { $match: { status: "published" } },
    { $group: { _id: "$city", count: { $sum: 1 }, from: { $min: "$priceFrom" } } },
    { $sort: { count: -1 } },
  ]);
  return rows.map((r) => ({ city: r._id, count: r.count, from: r.from }));
}

/** Homepage rail. Featured first, then best rated. */
export async function getPopularHotels(limit = 6): Promise<HotelCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.home(), tags.hotels());

  await connectDB();
  const hotels = await Hotel.find({ status: "published" })
    .select(CARD_FIELDS)
    .sort({ featured: -1, listingPriority: -1, displayRating: -1 })
    .limit(limit)
    .lean();
  return hotels.map(toCard);
}

export interface SearchFilters {
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  stars?: number[];
  minRating?: number;
  amenities?: string[];
  sort?: string;
}

/**
 * The descriptive half of search — cached per city and filter combination.
 * Availability and per-night pricing are deliberately excluded; they are
 * resolved separately at request time.
 */
export async function searchHotels(filters: SearchFilters): Promise<HotelCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.hotels());
  if (filters.destination) cacheTag(tags.hotelsByCity(filters.destination));

  await connectDB();
  const query: Record<string, unknown> = { status: "published" };

  if (filters.destination) {
    // Matches either the city or the area description, so "Inani Beach" works
    // as well as "Cox's Bazar".
    const rx = new RegExp(escapeRegex(filters.destination), "i");
    query.$or = [{ city: rx }, { location: rx }, { name: rx }];
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    query.priceFrom = {
      ...(filters.minPrice != null ? { $gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { $lte: filters.maxPrice } : {}),
    };
  }
  if (filters.stars?.length) query.starCategory = { $in: filters.stars };
  if (filters.minRating != null) query.displayRating = { $gte: filters.minRating };
  if (filters.amenities?.length) query.amenities = { $all: filters.amenities };

  const SORTS: Record<string, Record<string, 1 | -1>> = {
    "price-asc": { priceFrom: 1 },
    "price-desc": { priceFrom: -1 },
    rating: { displayRating: -1 },
    reviews: { displayReviewCount: -1 },
  };
  const sort = SORTS[filters.sort ?? "price-asc"] ?? SORTS["price-asc"];

  const hotels = await Hotel.find(query)
    .select(CARD_FIELDS)
    .sort({ featured: -1, ...sort })
    .limit(60)
    .lean();

  return hotels.map(toCard);
}

/** Full detail for a listing page. Cached and tagged so edits publish instantly. */
export async function getHotelBySlug(slug: string) {
  "use cache";
  cacheLife("days");
  cacheTag(tags.hotels());

  await connectDB();
  const hotel = await Hotel.findOne({ slug, status: "published" }).lean();
  if (!hotel) return null;

  cacheTag(tags.hotel(String(hotel._id)));

  const rooms = await Room.find({ hotelId: hotel._id, status: "active" })
    .sort({ basePrice: 1 })
    .lean();

  return {
    id: String(hotel._id),
    name: hotel.name,
    slug: hotel.slug,
    description: hotel.description,
    propertyType: hotel.propertyType,
    starCategory: hotel.starCategory,
    address: hotel.address,
    city: hotel.city,
    country: hotel.country,
    location: hotel.location,
    geo: hotel.geo ? { lat: hotel.geo.coordinates[1], lng: hotel.geo.coordinates[0] } : null,
    distanceFromCenter: hotel.distanceFromCenter,
    images: hotel.images.map((i) => ({ url: i.url, alt: i.alt ?? hotel.name })),
    amenities: hotel.amenities,
    tags: hotel.tags,
    policies: hotel.policies,
    displayRating: hotel.displayRating,
    displayReviewCount: hotel.displayReviewCount,
    priceFrom: hotel.priceFrom,
    currency: hotel.currency,
    rooms: rooms.map((r) => {
      const resolved = resolveRoom(r);
      return {
        id: String(r._id),
        name: r.name,
        description: r.description,
        bedType: r.bedType,
        sizeSqm: r.sizeSqm,
        maxAdults: r.maxAdults,
        maxChildren: r.maxChildren,
        basePrice: resolved.basePrice,
        pricingMode: resolved.pricingMode,
        totalUnits: r.totalUnits,
        images: r.images.map((i) => i.url),
        amenities: r.amenities,
      };
    }),
  };
}

export type HotelDetail = NonNullable<Awaited<ReturnType<typeof getHotelBySlug>>>;

/** Published reviews for a listing. */
export async function getHotelReviews(hotelId: string, limit = 8) {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.reviews(hotelId));

  await connectDB();
  const reviews = await Review.find({ hotelId, status: "published" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return reviews.map((r) => ({
    id: String(r._id),
    authorName: r.authorName,
    rating: r.rating,
    title: r.title,
    body: r.body,
    tripType: r.tripType,
    createdAt: r.createdAt.toISOString(),
    vendorReply: r.vendorReply ? { body: r.vendorReply.body, at: r.vendorReply.at.toISOString() } : null,
  }));
}

/** Distribution of the true published ratings, for the bar chart on a listing. */
export async function getRatingBreakdown(hotelId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.reviews(hotelId));

  await connectDB();
  const rows = await Review.aggregate<{ _id: number; count: number }>([
    { $match: { hotelId: new Types.ObjectId(hotelId), status: "published" } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
  ]);
  const map = new Map(rows.map((r) => [r._id, r.count]));
  return [5, 4, 3, 2, 1].map((star) => ({ star, count: map.get(star) ?? 0 }));
}

/** One extra a guest can tick, priced for the dates actually being booked. */
export interface RoomOptionOffer {
  code: string;
  label: string;
  description?: string;
  price: number;
  per: "night" | "stay";
  /** What ticking it adds to this stay, across all rooms booked. */
  amount: number;
  breakfast: boolean;
  refundable: boolean;
  cancellationHours: number;
}

/**
 * A room has exactly one price. Everything else a guest might want is an extra
 * they add on top of it, one by one.
 */
export interface RoomOffer {
  roomId: string;
  pricingMode: PricingMode;
  /** Per night, per room, with per-person occupancy already applied. */
  nightlyAverage: number;
  /** The room itself for the whole stay: nightly x nights x rooms. */
  total: number;
  nights: number;
  units: number;
  guests: number;
  breakfast: boolean;
  refundable: boolean;
  cancellationHours: number;
  options: RoomOptionOffer[];
  available: boolean;
  reason?: string;
  unitsLeft: number;
}

/**
 * Live pricing and availability for every room over a date range.
 * Never cached — a stale price here is a support ticket.
 */
export async function getRoomOffers(
  hotelId: string,
  checkIn: string,
  checkOut: string,
  units = 1,
  guests = 1,
): Promise<Record<string, RoomOffer>> {
  await connectDB();
  const rooms = await Room.find({ hotelId, status: "active" }).lean();
  const from = toNight(checkIn);
  const to = toNight(checkOut);
  const nights = countNights(from, to);
  const result: Record<string, RoomOffer> = {};

  for (const room of rooms) {
    const resolved = resolveRoom(room);
    const occupancy = occupancyFor(resolved.pricingMode, guests);
    const availability = await checkAvailability(room, from, to, units);
    const unitsLeft = availability.nights.length
      ? Math.min(...availability.nights.map((n) => n.unitsFree))
      : room.totalUnits;

    const total = availability.nights.reduce((sum, n) => sum + n.price * occupancy * units, 0);

    result[String(room._id)] = {
      roomId: String(room._id),
      pricingMode: resolved.pricingMode,
      nightlyAverage:
        nights > 0 ? Math.round(total / nights / units) : resolved.basePrice * occupancy,
      total,
      nights,
      units,
      guests,
      breakfast: resolved.breakfast,
      refundable: resolved.refundable,
      cancellationHours: resolved.cancellationHours,
      options: resolved.options.map((o) => ({
        code: o.code,
        label: o.label,
        description: o.description,
        price: o.price,
        per: o.per,
        amount: o.price * (o.per === "night" ? Math.max(1, nights) : 1) * units,
        breakfast: o.breakfast,
        refundable: o.refundable,
        cancellationHours: o.cancellationHours,
      })),
      available: availability.available,
      reason: availability.reason,
      unitsLeft,
    };
  }

  return result;
}

/** Cheapest live nightly rate across a set of hotels, for search cards. */
export async function getLivePricing(
  hotelIds: string[],
  checkIn: string,
  checkOut: string,
  units = 1,
  guests = 1,
): Promise<Record<string, { from: number; soldOut: boolean }>> {
  await connectDB();
  const rooms = await Room.find({ hotelId: { $in: hotelIds }, status: "active" }).lean();
  const from = toNight(checkIn);
  const to = toNight(checkOut);
  const nights = Math.max(1, countNights(from, to));

  const out: Record<string, { from: number; soldOut: boolean }> = {};

  for (const room of rooms) {
    const hotelId = String(room.hotelId);
    const occupancy = occupancyFor(resolveRoom(room).pricingMode, guests);
    const availability = await checkAvailability(room, from, to, units);
    if (!availability.available) {
      out[hotelId] ??= { from: Number.POSITIVE_INFINITY, soldOut: true };
      continue;
    }
    // The headline price is the room on its own — extras are opt-in, so they
    // must never inflate what search advertises.
    const nightly = Math.round((availability.total / nights / units) * occupancy);
    const existing = out[hotelId];
    if (!existing || nightly < existing.from) {
      out[hotelId] = { from: nightly, soldOut: false };
    }
  }

  for (const [id, value] of Object.entries(out)) {
    if (!Number.isFinite(value.from)) out[id] = { from: 0, soldOut: true };
  }
  return out;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
