import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Coffee, ShieldCheck } from "lucide-react";
import { cdn } from "@/lib/services/cloudinary";
import type { HotelCardData } from "@/lib/services/public-hotels";
import type { Stay } from "@/lib/utils/stay";

export default function HotelCard({
  hotel,
  stay,
  guests,
  rooms,
  price,
}: {
  hotel: HotelCardData;
  stay: Stay;
  guests: string;
  rooms: string;
  /** Streamed separately so the card paints before pricing resolves. */
  price: React.ReactNode;
}) {
  const href = `/hotels/${slugCity(hotel.city)}/${hotel.slug}?checkIn=${stay.checkIn}&checkOut=${stay.checkOut}&guests=${guests}&rooms=${rooms}`;

  return (
    <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-brand-300 hover:shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row">
        <Link href={href} className="sm:w-64 shrink-0 relative aspect-[4/3] sm:aspect-auto sm:self-stretch sm:min-h-44 bg-slate-100">
          {hotel.image ? (
            <Image
              src={cdn(hotel.image, 512, 384)}
              alt={hotel.name}
              fill
              sizes="(max-width: 640px) 100vw, 256px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-100" aria-hidden="true" />
          )}
          {hotel.tags[0] && (
            <span className="absolute top-2.5 left-2.5 bg-white/95 text-slate-700 text-[11px] font-bold px-2 py-1 rounded-lg">
              {hotel.tags[0]}
            </span>
          )}
        </Link>

        <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              {Array.from({ length: hotel.starCategory }).map((_, i) => (
                <Star key={i} size={11} className="text-amber-400 fill-amber-400" aria-hidden="true" />
              ))}
              <span className="sr-only">{hotel.starCategory}-star property</span>
            </div>

            <h2 className="font-bold text-slate-900 truncate">
              <Link href={href} className="hover:text-brand-600 transition-colors">
                {hotel.name}
              </Link>
            </h2>

            <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <MapPin size={12} className="shrink-0" aria-hidden="true" />
              <span className="truncate">
                {hotel.location}
                {hotel.distanceFromCenter != null && ` · ${hotel.distanceFromCenter} km from centre`}
              </span>
            </p>

            <p className="text-sm text-slate-600 mt-2 line-clamp-2">{hotel.description}</p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5">
              {hotel.displayReviewCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="bg-brand-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded tabular-nums">
                    {hotel.displayRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {hotel.displayReviewCount.toLocaleString("en-BD")} reviews
                  </span>
                </span>
              )}
              {hotel.amenities.slice(0, 3).map((a) => (
                <span key={a} className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                  {a}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-2.5">
              {hotel.freeCancellation && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                  <ShieldCheck size={12} aria-hidden="true" /> Free cancellation
                </span>
              )}
              {hotel.amenities.some((a) => /breakfast/i.test(a)) && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                  <Coffee size={12} aria-hidden="true" /> Breakfast available
                </span>
              )}
            </div>
          </div>

          <div className="sm:w-40 shrink-0 flex sm:flex-col items-end justify-between gap-2">
            {price}
            <Link
              href={href}
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              See rooms
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function slugCity(city: string): string {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
