"use client";

import FilterPanel from "./FilterPanel";
import { useHotelFilterState, type HotelFiltersParams } from "./useHotelFilterState";

/** The filters panel as it sits in the desktop sidebar, under the search card. */
export default function HotelFiltersDesktop({ params }: { params: HotelFiltersParams }) {
  const { stars, amenities, activeCount, apply, toggleIn, clearAll } = useHotelFilterState(params);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <FilterPanel
        params={params}
        stars={stars}
        amenities={amenities}
        activeCount={activeCount}
        apply={apply}
        toggleIn={toggleIn}
        clearAll={clearAll}
      />
    </div>
  );
}
