import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { Destination, Offer } from "@/lib/models/HomeContent";
import { tags } from "@/lib/cache/tags";

export interface DestinationCard {
  id: string;
  city: string;
  country: string;
  description: string;
  image: string;
  startingPrice: number;
  currency: string;
  flightDuration?: string;
  href: string;
}

export interface OfferCard {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: string;
  code?: string;
  type: "hotel" | "flight";
  href: string;
  expiresAt: string;
}

/** Popular destinations, exactly as the platform admin ordered them. */
export async function getFeaturedDestinations(): Promise<DestinationCard[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.home());

  await connectDB();
  const rows = await Destination.find({ status: "published" })
    .sort({ order: 1, createdAt: 1 })
    .limit(20)
    .lean();

  return rows.map((d) => ({
    id: String(d._id),
    city: d.city,
    country: d.country,
    description: d.description,
    image: d.image.url,
    startingPrice: d.startingPrice,
    currency: d.currency,
    flightDuration: d.flightDuration,
    href: d.href || `/flights/search?to=${encodeURIComponent(d.city)}`,
  }));
}

/** Live promotions. Anything already expired is dropped rather than shown stale. */
export async function getActiveOffers(): Promise<OfferCard[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.home());

  await connectDB();
  const rows = await Offer.find({ status: "published", expiresAt: { $gt: new Date() } })
    .sort({ order: 1, expiresAt: 1 })
    .limit(20)
    .lean();

  return rows.map((o) => ({
    id: String(o._id),
    title: o.title,
    description: o.description,
    image: o.image.url,
    discount: o.discount,
    code: o.code,
    type: o.type,
    href: o.href || (o.type === "flight" ? "/flights/search" : "/hotels/search"),
    expiresAt: o.expiresAt.toISOString(),
  }));
}
