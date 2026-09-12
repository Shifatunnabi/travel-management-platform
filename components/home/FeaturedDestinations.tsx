import Image from "next/image";
import Link from "next/link";
import { MapPin, Plane, ArrowRight } from "lucide-react";
import { getFeaturedDestinations } from "@/lib/services/home-content";
import { cacheLife, cacheTag } from "next/cache";
import { cdn } from "@/lib/services/cloudinary";
import { tags } from "@/lib/cache/tags";
import { formatCurrency } from "@/lib/utils/formatters";
import Carousel from "./Carousel";

/**
 * Curated in the admin under Content — nothing here is hard-coded. The section
 * disappears entirely rather than showing an empty rail when nothing is live.
 */
export default async function FeaturedDestinations() {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.home());

  const destinations = await getFeaturedDestinations();
  if (destinations.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">
              Popular Destinations
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Where would you like to go?
            </h2>
            <p className="text-slate-500 mt-2 text-base">
              Explore top destinations loved by travelers around the world
            </p>
          </div>
          <Link
            href="/hotels/search"
            className="hidden sm:flex items-center gap-1.5 text-brand-600 font-semibold text-sm hover:text-brand-700 transition-colors"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <Carousel label="destination" count={destinations.length}>
          {destinations.map((dest, i) => (
            <Link
              key={dest.id}
              href={dest.href}
              tabIndex={i === 0 ? undefined : -1}
              className="group relative block overflow-hidden rounded-2xl"
            >
              <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden bg-slate-100">
                <Image
                  src={cdn(dest.image, 1400, 700)}
                  alt={dest.city}
                  fill
                  priority={i === 0}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 1100px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                {dest.flightDuration && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Plane size={11} />
                    {dest.flightDuration}
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-white/80 text-xs mb-1">
                        <MapPin size={12} />
                        {dest.country}
                      </div>
                      <h3 className="text-white text-2xl sm:text-3xl font-bold leading-tight">
                        {dest.city}
                      </h3>
                      {dest.description && (
                        <p className="text-white/75 text-sm mt-1 line-clamp-1">{dest.description}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white/70 text-xs">From</p>
                      <p className="text-white text-xl font-bold">
                        {formatCurrency(dest.startingPrice, dest.currency)}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-white text-sm font-semibold">
                        Book now <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </Carousel>

        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/hotels/search"
            className="flex items-center gap-1.5 text-brand-600 font-semibold text-sm"
          >
            View all destinations <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
