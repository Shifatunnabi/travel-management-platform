"use client";

import { useState } from "react";
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
 *
 * The panel renders twice: as a sidebar on desktop, and inside a drawer on
 * small screens. It used to be `hidden lg:block` only, which left phones — most
 * of the traffic — with no way to filter at all.
 */
export default function HotelFilters({ params }: HotelFiltersProps) {
  const router = useRouter();
  const search = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const stars = (params.stars ?? "").split(",").filter(Boolean);
  const amenities = (params.amenities ?? "").split(",").filter(Boolean);

  const activeCount =
    stars.length +
    amenities.length +
    (params.minRating ? 1 : 0) +
    (params.minPrice ? 1 : 0) +
    (params.maxPrice ? 1 : 0);

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

  const clearAll = () => {
    const next = new URLSearchParams(search.toString());
    ["stars", "minPrice", "maxPrice", "minRating", "amenities"].forEach((k) => next.delete(k));
    router.push(`/hotels/search?${next}`);
  };

  const panel = (
    <FilterPanel
      params={params}
      stars={stars}
      amenities={amenities}
      activeCount={activeCount}
      apply={apply}
      toggleIn={toggleIn}
      clearAll={clearAll}
    />
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24">{panel}</div>
      </aside>

      {/* Mobile trigger — floats clear of the results so it is always reachable */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-xl transition-colors"
      >
        <SlidersHorizontal size={15} aria-hidden="true" />
        Filters
        {activeCount > 0 && (
          <span className="bg-white text-brand-700 text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center tabular-nums">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="relative w-full max-h-[85vh] overflow-y-auto bg-white rounded-t-2xl p-5 pb-28"
          >
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close filters"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
            {panel}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterPanel({
  params,
  stars,
  amenities,
  activeCount,
  apply,
  toggleIn,
  clearAll,
}: {
  params: HotelFiltersProps["params"];
  stars: string[];
  amenities: string[];
  activeCount: number;
  apply: (key: string, value: string | null) => void;
  toggleIn: (key: string, current: string[], value: string) => void;
  clearAll: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <SlidersHorizontal size={15} className="text-brand-500" aria-hidden="true" />
          Filters
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
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
        {params.minRating && (
          <button
            type="button"
            onClick={() => apply("minRating", null)}
            className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 mt-1.5"
          >
            Any rating
          </button>
        )}
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
    </>
  );
}
