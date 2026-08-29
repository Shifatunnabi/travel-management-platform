import Image from "next/image";
import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { MapPin, ArrowRight, Star } from "lucide-react";
import { getPopularHotels } from "@/lib/services/public-hotels";
import { cdn } from "@/lib/services/cloudinary";
import { formatCurrency } from "@/lib/utils/formatters";
import { tags } from "@/lib/cache/tags";

/**
 * Cached UI, not just cached data: the whole rail becomes part of the static
 * shell, so the homepage paints it without waiting on the database.
 */
export default async function PopularHotels() {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.home(), tags.hotels());

  const hotels = await getPopularHotels(4);
  if (hotels.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">
              Top Rated Hotels
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Popular Hotels</h2>
            <p className="text-slate-500 mt-2 text-base">
              Handpicked properties loved by our guests
            </p>
          </div>
          <Link
            href="/hotels/search"
            className="hidden sm:flex items-center gap-1.5 text-brand-600 font-semibold text-sm hover:text-brand-700 transition-colors"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {hotels.map((hotel) => (
            <Link
              key={hotel.id}
              href={`/hotels/${citySlug(hotel.city)}/${hotel.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-brand-300 hover:shadow-lg transition-all"
            >
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                {hotel.image && (
                  <Image
                    src={cdn(hotel.image, 500, 375)}
                    alt={hotel.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {hotel.displayReviewCount > 0 && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 text-slate-800 text-xs font-bold px-2 py-1 rounded-lg tabular-nums">
                    <Star size={11} className="text-amber-500 fill-amber-500" aria-hidden="true" />
                    {hotel.displayRating.toFixed(1)}
                  </span>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center gap-0.5 mb-1.5">
                  {Array.from({ length: hotel.starCategory }).map((_, i) => (
                    <Star key={i} size={10} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <h3 className="font-bold text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                  {hotel.name}
                </h3>
                <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <MapPin size={11} className="shrink-0" aria-hidden="true" />
                  <span className="truncate">{hotel.location}</span>
                </p>
                <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">from</span>
                  <span className="text-lg font-bold text-slate-900 tabular-nums">
                    {formatCurrency(hotel.priceFrom, hotel.currency)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function citySlug(city: string): string {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
