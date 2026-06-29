import Image from "next/image";
import Link from "next/link";
import { MapPin, Wifi, Waves, ArrowRight, Star } from "lucide-react";
import { mockHotels } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/formatters";
import Badge from "@/components/ui/Badge";
import RatingStars from "@/components/ui/RatingStars";

export default function PopularHotels() {
  const hotels = mockHotels.slice(0, 4);

  return (
    <section className="py-16 lg:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">
              Top Rated Hotels
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Popular Hotels
            </h2>
            <p className="text-slate-500 mt-2 text-base">
              Handpicked properties loved by our guests
            </p>
          </div>
          <Link
            href="/hotels/search"
            className="hidden sm:flex items-center gap-1.5 text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {hotels.map((hotel) => (
            <Link
              key={hotel.id}
              href={`/hotels/${hotel.id}`}
              className="group bg-white rounded-2xl border border-slate-100 hover:border-blue-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={hotel.images[0]}
                  alt={hotel.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
                {hotel.originalPrice && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                    SALE
                  </div>
                )}
                {hotel.freeCancellation && (
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                    Free Cancel
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Star category */}
                <div className="flex items-center gap-1 mb-1.5">
                  {Array.from({ length: hotel.starCategory }).map((_, i) => (
                    <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-1 group-hover:text-blue-700 transition-colors">
                  {hotel.name}
                </h3>

                <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
                  <MapPin size={11} />
                  <span className="truncate">{hotel.location}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">
                    {hotel.rating.toFixed(1)}
                  </span>
                  <RatingStars rating={hotel.rating} size="sm" />
                  <span className="text-slate-400 text-xs">({hotel.reviewCount.toLocaleString()})</span>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {hotel.amenities.slice(0, 3).map((amenity) => (
                    <Badge key={amenity} variant="info" size="sm">
                      {amenity}
                    </Badge>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                  <div>
                    {hotel.originalPrice && (
                      <p className="text-xs text-slate-400 line-through">
                        {formatCurrency(hotel.originalPrice, hotel.currency)}
                      </p>
                    )}
                    <p className="text-lg font-bold text-slate-900">
                      {formatCurrency(hotel.pricePerNight, hotel.currency)}
                    </p>
                    <p className="text-xs text-slate-500">per night</p>
                  </div>
                  <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg group-hover:bg-blue-700 transition-colors">
                    Book Now
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/hotels/search"
            className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm"
          >
            View all hotels <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
