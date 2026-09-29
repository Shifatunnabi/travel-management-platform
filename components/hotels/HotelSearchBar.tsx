"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, Users, Search, SlidersHorizontal, X } from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import CityInput from "@/components/ui/CityInput";
import HotelSearchCard from "./HotelSearchCard";
import { useHotelSearchUI } from "./HotelSearchUIContext";
import { todayISO } from "@/lib/utils/formatters";

/**
 * The search summary on the results page, which opens into an editable form.
 *
 * It used to be a read-only strip whose "Modify search" link went back to the
 * homepage — so changing a date meant starting the search from scratch and
 * losing every filter. Editing here rewrites the URL in place, which keeps the
 * filters and sort that are already on it.
 */
export default function HotelSearchBar({
  destination,
  checkIn,
  checkOut,
  guests,
  rooms,
  nights,
  checkInLabel,
  checkOutLabel,
  cities,
}: {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  rooms: string;
  nights: number;
  checkInLabel: string;
  checkOutLabel: string;
  cities: string[];
}) {
  const router = useRouter();
  const search = useSearchParams();
  const today = todayISO();
  const { setFiltersOpen, modifyOpen, setModifyOpen } = useHotelSearchUI();

  const [open, setOpen] = useState(false);
  const [dest, setDest] = useState(destination);
  const [from, setFrom] = useState(checkIn);
  const [to, setTo] = useState(checkOut);
  const [people, setPeople] = useState(Number(guests) || 2);
  const [units, setUnits] = useState(Number(rooms) || 1);

  const submit = () => {
    // Start from the current URL so stars, price, amenities and sort survive.
    const next = new URLSearchParams(search.toString());
    if (dest.trim()) next.set("destination", dest.trim());
    else next.delete("destination");
    if (from) next.set("checkIn", from);
    if (to) next.set("checkOut", to);
    next.set("guests", String(people));
    next.set("rooms", String(units));
    router.push(`/hotels/search?${next}`);
    setOpen(false);
  };

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

          {/* Desktop: full summary + inline "Modify search" toggle. The sidebar
              search card covers this on desktop too, but this stays so the
              summary (and its expand-in-place editor) is still available here. */}
          <div className="hidden lg:flex flex-wrap items-center gap-3 text-sm font-medium">
            <div className="flex items-center gap-2 bg-brand-800 rounded-xl px-4 py-2">
              <MapPin size={14} aria-hidden="true" />
              <span className="font-bold">{destination || "All destinations"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-200">
              <Calendar size={14} aria-hidden="true" />
              <span>
                {checkInLabel} → {checkOutLabel} · {nights} night{nights === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-200">
              <Users size={14} aria-hidden="true" />
              <span>
                {guests} guest{guests === "1" ? "" : "s"} · {rooms} room{rooms === "1" ? "" : "s"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-white bg-secondary-500 hover:bg-secondary-400 border border-secondary-400/40 rounded-lg px-3 py-1.5 transition-colors"
            >
              {open ? <X size={13} /> : <SlidersHorizontal size={13} />}
              {open ? "Close" : "Modify search"}
            </button>
          </div>

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

        {open && (
          <div className="mt-4 bg-white rounded-2xl p-4 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_auto] gap-3 items-end">
              <CityInput
                value={dest}
                onChange={setDest}
                cities={cities}
                onSubmit={submit}
                inputId="modify-destination"
                placeholder="City, hotel name, or area"
              />
              <DatePicker
                label="Check-In"
                value={from}
                onChange={setFrom}
                min={today}
                containerClassName="min-w-0 relative"
              />
              <DatePicker
                label="Check-Out"
                value={to}
                onChange={setTo}
                min={from || today}
                containerClassName="min-w-0 relative"
              />
              <button
                type="button"
                onClick={submit}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white font-bold text-sm rounded-xl transition-colors h-[52px]"
              >
                <Search size={16} aria-hidden="true" />
                Search
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3 max-w-md">
              <Stepper label="Guests" value={people} min={1} max={20} onChange={setPeople} />
              <Stepper label="Rooms" value={units} min={1} max={5} onChange={setUnits} />
            </div>
          </div>
        )}
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

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="border border-slate-200 rounded-xl px-3 py-2.5">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-800 flex-1 tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Fewer ${label.toLowerCase()}`}
          className="w-6 h-6 rounded-full border border-slate-300 hover:border-brand-500 flex items-center justify-center text-slate-600 hover:text-brand-600 text-base leading-none transition-colors"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`More ${label.toLowerCase()}`}
          className="w-6 h-6 rounded-full border border-slate-300 hover:border-brand-500 flex items-center justify-center text-slate-600 hover:text-brand-600 text-base leading-none transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
