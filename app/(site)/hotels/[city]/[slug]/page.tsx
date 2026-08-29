import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  MapPin, Star, ChevronRight, Users, Bed, Maximize,
  Coffee, ShieldCheck, XCircle, Clock, Baby, Dog,
} from "lucide-react";
import {
  getHotelBySlug, getHotelReviews, getRatingBreakdown, getRoomOffers,
} from "@/lib/services/public-hotels";
import { cdn } from "@/lib/services/cloudinary";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { defaultStay } from "@/lib/utils/stay";
import RoomOfferList from "@/components/hotels/RoomOfferList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) return { title: "Property not found · Tofiza" };

  return {
    title: `${hotel.name} · ${hotel.city} · Tofiza`,
    description: hotel.description.slice(0, 160),
    openGraph: {
      title: hotel.name,
      description: hotel.description.slice(0, 160),
      images: hotel.images[0] ? [{ url: hotel.images[0].url }] : undefined,
      type: "website",
    },
  };
}

export default function HotelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string; slug: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string; rooms?: string }>;
}) {
  return (
    <main className="min-h-screen bg-slate-50 pt-16">
      {/* Descriptive content is cached; only the room prices below stream. */}
      <Suspense fallback={<DetailSkeleton />}>
        <HotelBody params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function HotelBody({
  params,
  searchParams,
}: {
  params: Promise<{ city: string; slug: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string; rooms?: string }>;
}) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) notFound();

  const query = await searchParams;
  const stay = defaultStay(query.checkIn, query.checkOut);
  const guests = query.guests ?? "2";
  const rooms = query.rooms ?? "1";

  const [reviews, breakdown] = await Promise.all([
    getHotelReviews(hotel.id),
    getRatingBreakdown(hotel.id),
  ]);
  const totalRated = breakdown.reduce((sum, b) => sum + b.count, 0);

  return (
    <>
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm mb-3">
            <Link href="/" className="text-slate-500 hover:text-brand-600">Home</Link>
            <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
            <Link href="/hotels/search" className="text-slate-500 hover:text-brand-600">Hotels</Link>
            <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
            <span className="text-slate-800 font-medium truncate">{hotel.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                {Array.from({ length: hotel.starCategory }).map((_, i) => (
                  <Star key={i} size={13} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                ))}
                <span className="text-xs text-slate-500 ml-1 capitalize">{hotel.propertyType.replace(/_/g, " ")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{hotel.name}</h1>
              <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                <MapPin size={14} aria-hidden="true" />
                {hotel.address}
              </p>
            </div>

            {hotel.displayReviewCount > 0 && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {ratingWord(hotel.displayRating)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {hotel.displayReviewCount.toLocaleString("en-BD")} reviews
                  </p>
                </div>
                <span className="bg-brand-600 text-white text-lg font-bold px-3 py-2 rounded-xl tabular-nums">
                  {hotel.displayRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {hotel.images.length > 0 && <Gallery images={hotel.images} name={hotel.name} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-2">About this property</h2>
              <p className="text-slate-600 leading-relaxed">{hotel.description}</p>

              {hotel.amenities.length > 0 && (
                <>
                  <h3 className="font-bold text-slate-900 text-sm mt-6 mb-3">Amenities</h3>
                  <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {hotel.amenities.map((a) => (
                      <li key={a} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" aria-hidden="true" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            <section id="rooms" className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-baseline justify-between gap-3 mb-4">
                <h2 className="font-bold text-slate-900">Choose a room</h2>
                <p className="text-sm text-slate-500">
                  {stay.checkInLabel} – {stay.checkOutLabel} · {stay.nights} night
                  {stay.nights === 1 ? "" : "s"}
                </p>
              </div>

              {hotel.rooms.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">
                  This property has no rooms on sale right now.
                </p>
              ) : (
                <Suspense fallback={<RoomsSkeleton count={hotel.rooms.length} />}>
                  <LiveRooms
                    hotel={hotel}
                    stay={stay}
                    guests={guests}
                    rooms={rooms}
                  />
                </Suspense>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4">Guest reviews</h2>

              {totalRated === 0 ? (
                <p className="text-sm text-slate-500">
                  No reviews yet. Only guests who completed a stay here can leave one.
                </p>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-6 mb-6">
                    <div className="text-center sm:text-left shrink-0">
                      <p className="text-4xl font-bold text-slate-900 tabular-nums">
                        {hotel.displayRating.toFixed(1)}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {hotel.displayReviewCount.toLocaleString("en-BD")} reviews
                      </p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {breakdown.map(({ star, count }) => (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-3 tabular-nums">{star}</span>
                          <Star size={11} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${totalRated ? (count / totalRated) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-6 text-right tabular-nums">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {reviews.map((r) => (
                      <li key={r.id} className="border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-brand-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded tabular-nums">
                            {r.rating}.0
                          </span>
                          {r.title && <p className="font-semibold text-slate-900 text-sm">{r.title}</p>}
                        </div>
                        <p className="text-sm text-slate-600">{r.body}</p>
                        <p className="text-xs text-slate-400 mt-1.5">
                          {r.authorName}
                          {r.tripType && ` · ${r.tripType}`} · {formatDate(r.createdAt)}
                        </p>
                        {r.vendorReply && (
                          <div className="mt-3 ml-4 pl-3 border-l-2 border-brand-200">
                            <p className="text-[11px] font-semibold text-brand-700">Response from {hotel.name}</p>
                            <p className="text-sm text-slate-600 mt-0.5">{r.vendorReply.body}</p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:sticky lg:top-24">
              <p className="text-xs text-slate-500">Rooms from</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {formatCurrency(hotel.priceFrom, hotel.currency)}
                <span className="text-sm font-normal text-slate-400"> / night</span>
              </p>
              <a
                href="#rooms"
                className="mt-4 block text-center bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                See available rooms
              </a>

              <dl className="mt-5 pt-5 border-t border-slate-100 space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <Clock size={15} className="text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <dt className="text-slate-500 text-xs">Check-in / check-out</dt>
                    <dd className="font-medium text-slate-800">
                      From {hotel.policies.checkInTime} · until {hotel.policies.checkOutTime}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={15} className="text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <dt className="text-slate-500 text-xs">Cancellation</dt>
                    <dd className="font-medium text-slate-800">
                      {hotel.policies.cancellationHours > 0
                        ? `Free up to ${hotel.policies.cancellationHours}h before check-in on refundable rates`
                        : "Non-refundable"}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Baby size={15} className="text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <dt className="text-slate-500 text-xs">Children</dt>
                    <dd className="font-medium text-slate-800">
                      {hotel.policies.childrenAllowed ? "Welcome" : "Not accommodated"}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Dog size={15} className="text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <dt className="text-slate-500 text-xs">Pets</dt>
                    <dd className="font-medium text-slate-800">
                      {hotel.policies.petsAllowed ? "Allowed" : "Not allowed"}
                    </dd>
                  </div>
                </div>
              </dl>

              {hotel.policies.extraNotes && (
                <p className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  {hotel.policies.extraNotes}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

/** Prices and availability for the chosen dates — request-time, never cached. */
async function LiveRooms({
  hotel,
  stay,
  guests,
  rooms,
}: {
  hotel: NonNullable<Awaited<ReturnType<typeof getHotelBySlug>>>;
  stay: ReturnType<typeof defaultStay>;
  guests: string;
  rooms: string;
}) {
  const units = Number(rooms) || 1;
  const offers = await getRoomOffers(hotel.id, stay.checkIn, stay.checkOut, units);

  return (
    <RoomOfferList
      hotelSlug={hotel.slug}
      hotelCity={hotel.city}
      nights={stay.nights}
      checkIn={stay.checkIn}
      checkOut={stay.checkOut}
      guests={guests}
      rooms={rooms}
      items={hotel.rooms.map((room) => ({
        room: {
          id: room.id,
          name: room.name,
          description: room.description,
          bedType: room.bedType,
          sizeSqm: room.sizeSqm,
          maxAdults: room.maxAdults,
          maxChildren: room.maxChildren,
          image: room.images[0],
          amenities: room.amenities,
        },
        offers: offers[room.id] ?? [],
      }))}
    />
  );
}

function Gallery({ images, name }: { images: { url: string; alt: string }[]; name: string }) {
  const [cover, ...rest] = images;
  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-2 h-64 sm:h-96 rounded-2xl overflow-hidden">
      <div className="col-span-4 sm:col-span-2 row-span-2 relative bg-slate-100">
        <Image
          src={cdn(cover.url, 900, 700)}
          alt={cover.alt || name}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {rest.slice(0, 4).map((img, i) => (
        <div key={img.url + i} className="hidden sm:block col-span-1 row-span-1 relative bg-slate-100">
          <Image
            src={cdn(img.url, 400, 300)}
            alt={img.alt || name}
            fill
            sizes="25vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

function ratingWord(rating: number): string {
  if (rating >= 4.5) return "Exceptional";
  if (rating >= 4) return "Very good";
  if (rating >= 3.5) return "Good";
  if (rating >= 3) return "Pleasant";
  return "Rated";
}

function RoomsSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-36 bg-slate-50 border border-slate-200 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" aria-hidden="true">
      <div className="h-8 w-72 bg-slate-200 rounded animate-pulse" />
      <div className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-white border border-slate-200 rounded-2xl animate-pulse" />
        <div className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
