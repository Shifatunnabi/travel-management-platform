import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Maximize, BedDouble, Bath, AirVent, Fan, Users } from "lucide-react";
import { getHotelBySlug, getRoomOffer } from "@/lib/services/public-hotels";
import { defaultStay } from "@/lib/utils/stay";
import { amenityIcon, roomFacts } from "@/lib/utils/room-info";
import RoomGallery from "@/components/rooms/RoomGallery";
import { AddOnList, BookingCard, MobileReserveBar, RoomStayProvider } from "@/components/rooms/RoomStay";

type Params = Promise<{ city: string; slug: string; roomSlug: string }>;
type Query = Promise<{
  checkIn?: string;
  checkOut?: string;
  rooms?: string;
  adults?: string;
  children?: string;
}>;

const GOLD = "text-[#b08d57]";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, roomSlug } = await params;
  const hotel = await getHotelBySlug(slug);
  const room = hotel?.rooms.find((r) => r.slug === roomSlug);
  if (!hotel || !room) return { title: "Room not found · Tofiza" };

  const description = room.description.slice(0, 160) || `${room.name} at ${hotel.name}`;
  return {
    title: `${room.name} · ${hotel.name} · Tofiza`,
    description,
    openGraph: {
      title: `${room.name} at ${hotel.name}`,
      description,
      images: room.images[0] ? [{ url: room.images[0] }] : undefined,
      type: "website",
    },
  };
}

export default function RoomDetailPage({ params, searchParams }: { params: Params; searchParams: Query }) {
  return (
    <main
      className="min-h-screen bg-white pt-16 text-stone-900"
    >
      <Suspense fallback={<RoomSkeleton />}>
        <RoomBody params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

function clampInt(value: string | undefined, min: number, max: number, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

async function RoomBody({ params, searchParams }: { params: Params; searchParams: Query }) {
  const { city, slug, roomSlug } = await params;
  const hotel = await getHotelBySlug(slug);
  const room = hotel?.rooms.find((r) => r.slug === roomSlug);
  if (!hotel || !room) notFound();

  const query = await searchParams;
  const stay = defaultStay(query.checkIn, query.checkOut);
  const rooms = clampInt(query.rooms, 1, Math.min(10, room.totalUnits), 1);
  const adults = clampInt(query.adults, 1, Math.min(30, room.maxAdults * rooms), Math.min(2, room.maxAdults));
  const children = clampInt(query.children, 0, room.maxChildren * rooms, 0);

  // Live, never cached: the price and stock for exactly the dates on screen.
  const offer = await getRoomOffer(room.id, stay.checkIn, stay.checkOut, rooms, adults + children);
  const facts = roomFacts(room.amenities);
  const today = new Date().toISOString().slice(0, 10);
  const hotelHref = `/hotels/${city}/${hotel.slug}?checkIn=${stay.checkIn}&checkOut=${stay.checkOut}&guests=${adults + children}&rooms=${rooms}`;

  const included = [
    offer?.breakfast && "Breakfast included",
    offer?.refundable &&
      (offer.cancellationHours > 0
        ? `Free cancellation up to ${offer.cancellationHours}h before check-in`
        : "Free cancellation"),
    offer?.pricingMode === "per_person" && "Priced per guest",
  ].filter((x): x is string => Boolean(x));

  const facts_ = [
    room.sizeSqm ? { icon: Maximize, label: `${room.sizeSqm} m²` } : null,
    { icon: BedDouble, label: room.bedType },
    facts.washroom ? { icon: Bath, label: facts.washroom } : null,
    { icon: facts.hasAc ? AirVent : Fan, label: facts.hasAc ? "AC" : "Non-AC" },
    {
      icon: Users,
      label: `Up to ${room.maxAdults} adult${room.maxAdults === 1 ? "" : "s"}${
        room.maxChildren ? ` + ${room.maxChildren} child${room.maxChildren === 1 ? "" : "ren"}` : ""
      }`,
    },
  ].filter((f): f is NonNullable<typeof f> => f !== null);

  return (
    <RoomStayProvider>
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-stone-500 mb-8 flex-wrap">
          <Link href="/" className="hover:text-stone-900">Home</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <Link href={hotelHref} className="hover:text-stone-900">{hotel.name}</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span className="text-stone-900">{room.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] gap-x-[70px] gap-y-12 items-start">
          <div className="min-w-0 space-y-14">
            <header>
              <h1 className="text-4xl sm:text-[40px] leading-tight font-semibold tracking-tight">
                {room.name}
              </h1>
              <ul className="flex flex-wrap gap-x-9 gap-y-3 mt-8 text-sm">
                {facts_.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2.5">
                    <Icon size={24} strokeWidth={1.1} aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </header>

            <RoomGallery
              images={room.images.map((url) => ({ url, alt: room.name }))}
              name={room.name}
            />

            {room.description && (
              <p className="text-[17px] leading-[1.75] text-stone-700 sm:text-justify whitespace-pre-line">
                {room.description}
              </p>
            )}

            {room.amenities.length > 0 && (
              <section aria-labelledby="amenities">
                <h2 id="amenities" className="text-2xl font-semibold tracking-tight mb-6">
                  Room Amenities
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
                  {room.amenities.map((a) => {
                    const Icon = amenityIcon(a);
                    return (
                      <li key={a} className="flex items-center gap-4">
                        <Icon size={28} strokeWidth={1.1} className={`${GOLD} shrink-0`} aria-hidden="true" />
                        <span>{a}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {included.length > 0 && (
              <section aria-labelledby="included">
                <h2 id="included" className="text-2xl font-semibold tracking-tight mb-6">
                  What&rsquo;s included in this room?
                </h2>
                <ul className="space-y-3">
                  {included.map((line) => (
                    <li key={line} className="flex items-center gap-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b08d57] shrink-0" aria-hidden="true" />
                      {line}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {offer && <AddOnList options={offer.options} nights={offer.nights} />}
          </div>

          <aside className="lg:sticky lg:top-24">
            <BookingCard
              roomName={room.name}
              roomId={room.id}
              offer={offer}
              totalUnits={room.totalUnits}
              maxAdults={room.maxAdults}
              maxChildren={room.maxChildren}
              minDate={today}
              initial={{ checkIn: stay.checkIn, checkOut: stay.checkOut, rooms, adults, children }}
            />
          </aside>
        </div>
      </div>
      <MobileReserveBar nightly={offer?.nightlyAverage ?? null} />
    </RoomStayProvider>
  );
}

function RoomSkeleton() {
  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-hidden="true">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_440px] gap-x-[70px] gap-y-10">
        <div className="space-y-8">
          <div className="h-10 w-72 bg-stone-100 animate-pulse" />
          <div className="aspect-[3/1] bg-stone-100 animate-pulse" />
          <div className="h-40 bg-stone-100 animate-pulse" />
        </div>
        <div className="h-[560px] bg-stone-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
