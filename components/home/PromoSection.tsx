import Image from "next/image";
import Link from "next/link";
import { Clock, Tag, ArrowRight } from "lucide-react";
import { promoOffers } from "@/lib/mock-data";

export default function PromoSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">
            Limited Time Deals
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
            Special Offers
          </h2>
          <p className="text-slate-500 mt-2 text-base">
            Don't miss these exclusive promotions — book before they expire
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {promoOffers.map((promo, idx) => (
            <Link
              key={promo.id}
              href={promo.type === "flight" ? "/flights/search" : "/hotels/search"}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer block ${
                idx === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <div className={`relative overflow-hidden ${idx === 0 ? "h-80 md:h-full min-h-64" : "h-48"}`}>
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Discount badge */}
                <div className={`absolute top-4 left-4 ${promo.badgeColor} text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5`}>
                  <Tag size={13} />
                  {promo.discount}
                </div>

                {/* Expiry */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Clock size={11} />
                  Expires {new Date(promo.expiresAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  {promo.code && (
                    <div className="mb-2 inline-flex items-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-1">
                      <span className="text-white/80 text-xs mr-2">Code:</span>
                      <span className="text-white font-bold text-sm tracking-wider">{promo.code}</span>
                    </div>
                  )}
                  <h3 className={`text-white font-bold leading-tight ${idx === 0 ? "text-2xl" : "text-lg"}`}>
                    {promo.title}
                  </h3>
                  <p className={`text-white/80 mt-1 ${idx === 0 ? "text-sm" : "text-xs"} line-clamp-2`}>
                    {promo.description}
                  </p>
                  <div className="mt-3 h-0 overflow-hidden group-hover:h-8 transition-all duration-300">
                    <span className="flex items-center gap-1.5 text-white text-sm font-semibold">
                      Book now <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
