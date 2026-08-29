import { cacheLife, cacheTag } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Hotel } from "@/lib/models/Hotel";
import { Room } from "@/lib/models/Room";
import { Review } from "@/lib/models/Review";
import { tags } from "@/lib/cache/tags";
import { checkAvailability, countNights, toNight } from "./inventory";

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
    rooms: rooms.map((r) => ({
      id: String(r._id),
      name: r.name,
      description: r.description,
      bedType: r.bedType,
      sizeSqm: r.sizeSqm,
      maxAdults: r.maxAdults,
      maxChildren: r.maxChildren,
      basePrice: r.basePrice,
      totalUnits: r.totalUnits,
      images: r.images.map((i) => i.url),
      amenities: r.amenities,
      ratePlans: r.ratePlans.map((p) => ({ ...p })),
    })),
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

export interface RoomOffer {
  roomId: string;
  ratePlanCode: string;
  ratePlanName: string;
  breakfast: boolean;
  refundable: boolean;
  cancellationHours: number;
  nightlyAverage: number;
  total: number;
  available: boolean;
  reason?: string;
  unitsLeft: number;
}

/**
 * Live pricing and availability for every room and rate plan over a date range.
 * Never cached — a stale price here is a support ticket.
 */
export async function getRoomOffers(
  hotelId: string,
  checkIn: string,
  checkOut: string,
  units = 1,
): Promise<Record<string, RoomOffer[]>> {
  await connectDB();
  const rooms = await Room.find({ hotelId, status: "active" }).lean();
  const from = toNight(checkIn);
  const to = toNight(checkOut);
  const nights = countNights(from, to);
  const result: Record<string, RoomOffer[]> = {};

  for (const room of rooms) {
    const availability = await checkAvailability(room, from, to, units);
    const unitsLeft = availability.nights.length
      ? Math.min(...availability.nights.map((n) => n.unitsFree))
      : room.totalUnits;

    result[String(room._id)] = room.ratePlans.map((plan) => {
      const total = availability.nights.reduce(
        (sum, n) => sum + (n.price + plan.priceDelta) * units,
        0,
      );
      return {
        roomId: String(room._id),
        ratePlanCode: plan.code,
        ratePlanName: plan.name,
        breakfast: plan.breakfast,
        refundable: plan.refundable,
        cancellationHours: plan.cancellationHours,
        nightlyAverage: nights > 0 ? Math.round(total / nights / units) : room.basePrice + plan.priceDelta,
        total,
        available: availability.available,
        reason: availability.reason,
        unitsLeft,
      };
    });
  }

  return result;
}

/** Cheapest live nightly rate across a set of hotels, for search cards. */
export async function getLivePricing(
  hotelIds: string[],
  checkIn: string,
  checkOut: string,
  units = 1,
): Promise<Record<string, { from: number; soldOut: boolean }>> {
  await connectDB();
  const rooms = await Room.find({ hotelId: { $in: hotelIds }, status: "active" }).lean();
  const from = toNight(checkIn);
  const to = toNight(checkOut);
  const nights = Math.max(1, countNights(from, to));

  const out: Record<string, { from: number; soldOut: boolean }> = {};

  for (const room of rooms) {
    const hotelId = String(room.hotelId);
    const availability = await checkAvailability(room, from, to, units);
    if (!availability.available) {
      out[hotelId] ??= { from: Number.POSITIVE_INFINITY, soldOut: true };
      continue;
    }
    const cheapestPlan = Math.min(...room.ratePlans.map((p) => p.priceDelta), 0);
    const nightly = Math.round(availability.total / nights / units) + cheapestPlan;
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
