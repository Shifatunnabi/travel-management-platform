"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface HotelFilterState {
  priceMax: number;
  stars: number[];
  amenities: string[];
  breakfast: boolean | null;
  freeCancellation: boolean | null;
}

const amenityOptions = ["Free WiFi", "Pool", "Spa", "Gym", "Restaurant", "Parking", "Beach Access"];
const starOptions = [5, 4, 3, 2];

interface HotelFiltersProps {
  onFilterChange?: (filters: HotelFilterState) => void;
}

export default function HotelFilters({ onFilterChange }: HotelFiltersProps) {
  const [filters, setFilters] = useState<HotelFilterState>({
    priceMax: 30000,
    stars: [],
    amenities: [],
    breakfast: null,
    freeCancellation: null,
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (patch: Partial<HotelFilterState>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onFilterChange?.(next);
  };

  const toggleStar = (v: number) => {
    const stars = filters.stars.includes(v)
      ? filters.stars.filter((s) => s !== v)
      : [...filters.stars, v];
    update({ stars });
  };

  const toggleAmenity = (a: string) => {
    const amenities = filters.amenities.includes(a)
      ? filters.amenities.filter((x) => x !== a)
      : [...filters.amenities, a];
    update({ amenities });
  };

  const activeCount =
    filters.stars.length +
    filters.amenities.length +
    (filters.breakfast !== null ? 1 : 0) +
    (filters.freeCancellation !== null ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {activeCount > 0 && (
        <button
          onClick={() => update({ stars: [], amenities: [], breakfast: null, freeCancellation: null, priceMax: 30000 })}
          className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
        >
          <X size={12} /> Reset all filters
        </button>
      )}

      {/* Price range */}
      <div>
        <h3 className="font-semibold text-slate-800 text-sm mb-3">
          Price per Night
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>৳0</span>
            <span>৳{filters.priceMax.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={1000}
            max={30000}
            step={500}
            value={filters.priceMax}
            onChange={(e) => update({ priceMax: Number(e.target.value) })}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      {/* Star category */}
      <div>
        <h3 className="font-semibold text-slate-800 text-sm mb-3">Star Category</h3>
        <div className="space-y-2">
          {starOptions.map((star) => (
            <label key={star} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.stars.includes(star)}
                onChange={() => toggleStar(star)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm text-slate-700">
                {"★".repeat(star)} {star}-star
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h3 className="font-semibold text-slate-800 text-sm mb-3">Amenities</h3>
        <div className="space-y-2">
          {amenityOptions.map((a) => (
            <label key={a} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.amenities.includes(a)}
                onChange={() => toggleAmenity(a)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm text-slate-700">{a}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Options */}
      <div>
        <h3 className="font-semibold text-slate-800 text-sm mb-3">Options</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.breakfast === true}
              onChange={() => update({ breakfast: filters.breakfast === true ? null : true })}
              className="w-4 h-4 rounded border-slate-300 text-blue-600"
            />
            <span className="text-sm text-slate-700">Breakfast included</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.freeCancellation === true}
              onChange={() => update({ freeCancellation: filters.freeCancellation === true ? null : true })}
              className="w-4 h-4 rounded border-slate-300 text-blue-600"
            />
            <span className="text-sm text-slate-700">Free cancellation</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-xl font-semibold text-sm"
      >
        <SlidersHorizontal size={16} />
        Filters{activeCount > 0 && ` (${activeCount})`}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto w-80 bg-white h-full overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900">Filters</h2>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <FilterContent />
            <button onClick={() => setMobileOpen(false)} className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-semibold">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <div className="hidden lg:block w-64 shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-blue-500" />
              Filters
            </h2>
            {activeCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          <FilterContent />
        </div>
      </div>
    </>
  );
}
