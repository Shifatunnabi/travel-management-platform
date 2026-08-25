"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Users, Search, ChevronDown, BedDouble } from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";

const today = new Date().toISOString().split("T")[0];

export default function HotelSearchForm() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [showGuestDrop, setShowGuestDrop] = useState(false);

  const guests = adults + children;

  const handleSearch = () => {
    const p = new URLSearchParams({
      destination, checkIn, checkOut,
      guests: String(guests), rooms: String(rooms),
    });
    router.push(`/hotels/search?${p}`);
  };

  return (
    <div className="p-5 sm:p-6 flex flex-col gap-2">
      {/* ── Row 1: Destination (full width) ─────────────── */}
      <div className="border border-slate-200 hover:border-brand-400 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 rounded-xl px-3 py-2.5 transition-all">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Destination</p>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-brand-500 shrink-0" />
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="City, hotel name, or area"
            className="w-full text-sm font-bold text-slate-800 bg-transparent focus:outline-none placeholder-slate-300"
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5 pl-5">
          e.g. Cox&apos;s Bazar, Dhaka, Dubai
        </p>
      </div>

      {/* ── Row 2: Check-in | Check-out ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <DatePicker
          label="Check-In"
          value={checkIn}
          onChange={setCheckIn}
          min={today}
          containerClassName="min-w-0 relative"
        />
        <DatePicker
          label="Check-Out"
          value={checkOut}
          onChange={setCheckOut}
          min={checkIn || today}
          containerClassName="min-w-0 relative"
        />
      </div>

      {/* ── Row 3: Guests (dropdown) | Rooms ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Guests dropdown */}
        <div className="min-w-0 relative">
          <button
            type="button"
            onClick={() => setShowGuestDrop(!showGuestDrop)}
            className="w-full text-left border border-slate-200 hover:border-brand-400 rounded-xl px-3 py-2.5 transition-all"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Guests</p>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-brand-500 shrink-0" />
              <span className="text-sm font-bold text-slate-800 truncate">
                {guests} Guest{guests > 1 ? "s" : ""}
              </span>
              <ChevronDown size={12} className="text-slate-400 ml-auto shrink-0" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 pl-5">
              {adults} Adult{adults > 1 ? "s" : ""}
              {children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}
            </p>
          </button>

          {showGuestDrop && (
            <div className="absolute top-full mt-2 left-0 right-0 sm:right-auto bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 w-full sm:w-64 z-50">
              {[
                { label: "Adults", value: adults, set: setAdults, min: 1, max: 10 },
                { label: "Children", value: children, set: setChildren, min: 0, max: 8 },
              ].map(({ label, value, set, min, max }) => (
                <div key={label} className="flex items-center justify-between mb-4 last:mb-0">
                  <span className="font-medium text-slate-700 text-sm">{label}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => set(Math.max(min, value - 1))}
                      className="w-7 h-7 rounded-full border border-slate-300 hover:border-brand-500 flex items-center justify-center text-slate-600 hover:text-brand-600 text-lg leading-none transition-colors"
                    >−</button>
                    <span className="w-5 text-center font-bold text-slate-800 text-sm">{value}</span>
                    <button
                      type="button"
                      onClick={() => set(Math.min(max, value + 1))}
                      className="w-7 h-7 rounded-full border border-slate-300 hover:border-brand-500 flex items-center justify-center text-slate-600 hover:text-brand-600 text-lg leading-none transition-colors"
                    >+</button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setShowGuestDrop(false)}
                className="mt-4 w-full py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Rooms counter */}
        <div className="min-w-0 border border-slate-200 rounded-xl px-3 py-2.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rooms</p>
          <div className="flex items-center gap-1.5">
            <BedDouble size={14} className="text-brand-500 shrink-0" />
            <span className="text-sm font-bold text-slate-800 truncate flex-1">
              {rooms} Room{rooms > 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setRooms(Math.max(1, rooms - 1))}
                className="w-6 h-6 rounded-full border border-slate-300 hover:border-brand-500 flex items-center justify-center text-slate-600 hover:text-brand-600 text-base leading-none transition-colors"
              >−</button>
              <button
                type="button"
                onClick={() => setRooms(Math.min(5, rooms + 1))}
                className="w-6 h-6 rounded-full border border-slate-300 hover:border-brand-500 flex items-center justify-center text-slate-600 hover:text-brand-600 text-base leading-none transition-colors"
              >+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Search button */}
      <div className="mt-2 flex justify-center">
        <button
          onClick={handleSearch}
          className="flex items-center gap-2.5 px-10 py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Search size={16} />
          Search Hotels
        </button>
      </div>
    </div>
  );
}
