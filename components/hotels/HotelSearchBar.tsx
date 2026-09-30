"use client";

import Link from "next/link";
import { ArrowLeft, SlidersHorizontal, X } from "lucide-react";
import HotelSearchCard from "./HotelSearchCard";
import { useHotelSearchUI } from "./HotelSearchUIContext";

/**
 * The strip above the results. On desktop it is just a way back home, because
 * the sidebar search card already edits the search in place. On mobile it holds
 * the Modify search and Filters buttons.
 */
export default function HotelSearchBar({
  destination,
  checkIn,
  checkOut,
  guests,
  rooms,
  cities,
}: {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  rooms: string;
  cities: string[];
}) {
  const { setFiltersOpen, modifyOpen, setModifyOpen } = useHotelSearchUI();

  return (
    <div className="bg-brand-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-brand-200 hover:text-white text-sm transition-colors shrink-0"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Back to Home
          </Link>

          {/* Mobile/tablet: Modify search opens the same card as the desktop
              sidebar in a popup; Filters opens the shared drawer. */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              type="button"
              onClick={() => setModifyOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <SlidersHorizontal size={15} aria-hidden="true" />
              Modify Search
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <SlidersHorizontal size={15} aria-hidden="true" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Mobile "Modify search" popup — same card as the desktop sidebar */}
      {modifyOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setModifyOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Modify search"
            className="relative w-full max-h-[85vh] overflow-y-auto bg-white rounded-t-2xl p-5 text-slate-900"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">Modify search</h2>
              <button
                type="button"
                onClick={() => setModifyOpen(false)}
                aria-label="Close"
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <HotelSearchCard
              destination={destination}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              rooms={rooms}
              cities={cities}
              onSubmit={() => setModifyOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
