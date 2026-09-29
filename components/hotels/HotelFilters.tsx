"use client";

import { X } from "lucide-react";
import FilterPanel from "./FilterPanel";
import { useHotelFilterState, type HotelFiltersParams } from "./useHotelFilterState";
import { useHotelSearchUI } from "./HotelSearchUIContext";

/**
 * The mobile filters drawer. It used to render its own floating "Filters"
 * button too, but that now lives in the header bar next to "Modify search"
 * — both open this same drawer through HotelSearchUIContext.
 */
export default function HotelFilters({ params }: { params: HotelFiltersParams }) {
  const { filtersOpen, setFiltersOpen } = useHotelSearchUI();
  const { stars, amenities, activeCount, apply, toggleIn, clearAll } = useHotelFilterState(params);

  if (!filtersOpen) return null;

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
    <div className="lg:hidden fixed inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setFiltersOpen(false)}
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
          onClick={() => setFiltersOpen(false)}
          aria-label="Close filters"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
        >
          <X size={18} />
        </button>
        {panel}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            className="w-full bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}
