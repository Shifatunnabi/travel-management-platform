import Image from "next/image";
import Link from "next/link";
import { Clock, Tag, ArrowRight } from "lucide-react";
import { getActiveOffers } from "@/lib/services/home-content";
import { cacheLife, cacheTag } from "next/cache";
import { cdn } from "@/lib/services/cloudinary";
import { tags } from "@/lib/cache/tags";
import Carousel from "./Carousel";

/**
 * Curated in the admin under Content. Offers past their expiry are filtered out
 * server-side, so this never advertises a promotion that has already ended.
 */
export default async function PromoSection() {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.home());

  const offers = await getActiveOffers();
  if (offers.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">
            Limited Time Deals
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Special Offers</h2>
          <p className="text-slate-500 mt-2 text-base">
            Don&apos;t miss these exclusive promotions — book before they expire
          </p>
        </div>

        <Carousel label="offer" count={offers.length}>
          {offers.map((promo, i) => (
            <Link
              key={promo.id}
              href={promo.href}
              tabIndex={i === 0 ? undefined : -1}
              className="group relative block overflow-hidden rounded-2xl"
            >
              <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden bg-slate-100">
                <Image
                  src={cdn(promo.image, 1400, 700)}
                  alt={promo.title}
                  fill
                  priority={i === 0}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 1100px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute top-4 left-4 bg-brand-600 text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Tag size={13} />
                  {promo.discount}
                </div>

                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Clock size={11} />
                  Expires{" "}
                  {new Date(promo.expiresAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    timeZone: "UTC",
                  })}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  {promo.code && (
                    <div className="mb-2 inline-flex items-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-1">
                      <span className="text-white/80 text-xs mr-2">Code:</span>
                      <span className="text-white font-bold text-sm tracking-wider">{promo.code}</span>
                    </div>
                  )}
                  <h3 className="text-white font-bold leading-tight text-2xl sm:text-3xl">
                    {promo.title}
                  </h3>
                  {promo.description && (
                    <p className="text-white/80 mt-1 text-sm max-w-2xl line-clamp-2">
                      {promo.description}
                    </p>
                  )}
                  <span className="mt-3 inline-flex items-center gap-1.5 text-white text-sm font-semibold">
                    Book now <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
