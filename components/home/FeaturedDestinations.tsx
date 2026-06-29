import Image from "next/image";
import Link from "next/link";
import { MapPin, Plane, ArrowRight } from "lucide-react";
import { featuredDestinations } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/formatters";

export default function FeaturedDestinations() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">
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
            href="/flights/search"
            className="hidden sm:flex items-center gap-1.5 text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredDestinations.map((dest, idx) => (
            <Link
              key={dest.id}
              href={`/flights/search?to=${dest.city}`}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer block ${
                idx === 0 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.city}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Duration badge */}
                {dest.flightDuration && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Plane size={11} />
                    {dest.flightDuration}
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-white/80 text-xs mb-1">
                        <MapPin size={11} />
                        {dest.country}
                      </div>
                      <h3 className="text-white text-xl font-bold leading-tight">
                        {dest.city}
                      </h3>
                      <p className="text-white/70 text-xs mt-0.5 line-clamp-1">
                        {dest.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-white/70 text-xs">From</p>
                      <p className="text-white text-base font-bold">
                        {formatCurrency(dest.startingPrice, dest.currency)}
                      </p>
                    </div>
                  </div>
                  {/* CTA hover */}
                  <div className="mt-3 h-0 overflow-hidden group-hover:h-9 transition-all duration-300">
                    <span className="flex items-center gap-1.5 text-white text-sm font-semibold">
                      Book now <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/flights/search"
            className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm"
          >
            View all destinations <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
