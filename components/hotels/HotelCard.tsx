import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Wifi, CheckCircle } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/formatters";
import Badge from "@/components/ui/Badge";
import RatingStars from "@/components/ui/RatingStars";

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  return (
    <Link
      href={`/hotels/${hotel.id}`}
      className="group block bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl overflow-hidden transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative sm:w-64 shrink-0 h-52 sm:h-auto overflow-hidden">
          <Image
            src={hotel.images[0]}
            alt={hotel.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 256px"
          />
          {hotel.originalPrice && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              SALE
            </div>
          )}
          {/* Star category overlay */}
          <div className="absolute bottom-3 left-3 flex gap-0.5">
            {Array.from({ length: hotel.starCategory }).map((_, i) => (
              <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex-1">
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {hotel.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="info" size="sm">{tag}</Badge>
              ))}
              {hotel.freeCancellation && (
                <Badge variant="success" size="sm">Free Cancel</Badge>
              )}
              {hotel.breakfast && (
                <Badge variant="warning" size="sm">Breakfast Incl.</Badge>
              )}
            </div>

            <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1.5 group-hover:text-blue-700 transition-colors">
              {hotel.name}
            </h3>

            <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
              <MapPin size={13} />
              <span>{hotel.location}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400 text-xs">{hotel.distanceFromCenter} km from center</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-700 text-white text-xs font-bold px-2 py-1 rounded-lg">
                {hotel.rating.toFixed(1)}
              </span>
              <RatingStars rating={hotel.rating} size="sm" />
              <span className="text-slate-500 text-xs">
                {hotel.reviewCount.toLocaleString()} reviews
              </span>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {hotel.amenities.slice(0, 4).map((amenity) => (
                <span
                  key={amenity}
                  className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5"
                >
                  <CheckCircle size={10} className="text-blue-400" />
                  {amenity}
                </span>
              ))}
            </div>

            <p className="text-slate-500 text-sm line-clamp-2">{hotel.description}</p>
          </div>

          {/* Price & CTA */}
          <div className="flex items-end justify-between mt-4 pt-4 border-t border-slate-100">
            <div>
              {hotel.originalPrice && (
                <p className="text-xs text-slate-400 line-through">
                  {formatCurrency(hotel.originalPrice, hotel.currency)}
                </p>
              )}
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(hotel.pricePerNight, hotel.currency)}
              </p>
              <p className="text-xs text-slate-500">per night · excl. taxes</p>
            </div>
            <span className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors">
              View Rooms
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
