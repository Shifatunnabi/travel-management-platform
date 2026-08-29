"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

const AMENITIES = [
  "Free WiFi", "Swimming Pool", "Spa", "Restaurant", "Gym",
  "Beach Access", "Parking", "Airport Shuttle",
];

export interface HotelFiltersProps {
  params: {
    stars?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    amenities?: string;
  };
}

/**
 * Every filter is written to the URL, so a filtered result set is a shareable
 * link and the back button behaves the way people expect.
 */
export default function HotelFilters({ params }: HotelFiltersProps) {
  const router = useRouter();
  const search = useSearchParams();

  const stars = (params.stars ?? "").split(",").filter(Boolean);
  const amenities = (params.amenities ?? "").split(",").filter(Boolean);
  const hasFilters =
    stars.length > 0 || amenities.length > 0 || params.minPrice || params.maxPrice || params.minRating;

  const apply = (key: string, value: string | null) => {
    const next = new URLSearchParams(search.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    router.push(`/hotels/search?${next}`);
  };

  const toggleIn = (key: string, current: string[], value: string) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    apply(key, next.join(","));
  };

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <SlidersHorizontal size={15} className="text-brand-500" aria-hidden="true" />
            Filters
          </h2>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                const next = new URLSearchParams(search.toString());
                ["stars", "minPrice", "maxPrice", "minRating", "amenities"].forEach((k) => next.delete(k));
                router.push(`/hotels/search?${next}`);
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-600"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        <section className="mb-5">
          <h3 className="text-xs font-semibold text-slate-600 mb-2">Price per night</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder="Min"
              defaultValue={params.minPrice}
              onBlur={(e) => apply("minPrice", e.target.value)}
              aria-label="Minimum price"
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-brand-500 tabular-nums"
            />
            <span className="text-slate-400 text-sm" aria-hidden="true">–</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              defaultValue={params.maxPrice}
              onBlur={(e) => apply("maxPrice", e.target.value)}
              aria-label="Maximum price"
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-brand-500 tabular-nums"
            />
          </div>
        </section>

        <section className="mb-5">
          <h3 className="text-xs font-semibold text-slate-600 mb-2">Star class</h3>
          <div className="space-y-1">
            {[5, 4, 3, 2].map((n) => (
              <label key={n} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={stars.includes(String(n))}
                  onChange={() => toggleIn("stars", stars, String(n))}
                  className="w-4 h-4 rounded border-slate-300 text-brand-600"
                />
                {n} star
              </label>
            ))}
          </div>
        </section>

        <section className="mb-5">
          <h3 className="text-xs font-semibold text-slate-600 mb-2">Guest rating</h3>
          <div className="space-y-1">
            {[
              { value: "4.5", label: "Exceptional · 4.5+" },
              { value: "4", label: "Very good · 4.0+" },
              { value: "3.5", label: "Good · 3.5+" },
            ].map((o) => (
              <label key={o.value} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                <input
                  type="radio"
                  name="minRating"
                  checked={params.minRating === o.value}
                  onChange={() => apply("minRating", o.value)}
                  className="w-4 h-4 border-slate-300 text-brand-600"
                />
                {o.label}
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-slate-600 mb-2">Amenities</h3>
          <div className="space-y-1">
            {AMENITIES.map((a) => (
              <label key={a} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={amenities.includes(a)}
                  onChange={() => toggleIn("amenities", amenities, a)}
                  className="w-4 h-4 rounded border-slate-300 text-brand-600"
                />
                {a}
              </label>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
