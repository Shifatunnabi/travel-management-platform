"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, Search, ChevronDown } from "lucide-react";

export default function HotelSearchForm() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [showGuestDrop, setShowGuestDrop] = useState(false);

  const handleSearch = () => {
    const p = new URLSearchParams({
      destination, checkIn, checkOut,
      guests: String(guests), rooms: String(rooms),
    });
    router.push(`/hotels/search?${p}`);
  };

  return (
    <div className="p-5 sm:p-6">
      {/* ── Row 1: Destination (full width) ─────────────── */}
      <div className="mb-2">
        <div className="border border-slate-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-3 py-2.5 transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Destination</p>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-blue-500 shrink-0" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="City, hotel name, or area"
              className="w-full text-sm font-bold text-slate-800 bg-transparent focus:outline-none placeholder-slate-300"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 pl-5">
            e.g. Cox's Bazar, Dhaka, Dubai
          </p>
        </div>
      </div>

      {/* ── Row 2: Check-in | Check-out | Guests ─────────── */}
      <div className="flex items-stretch gap-2">
        {/* Check-in */}
        <div className="flex-1 min-w-0 border border-slate-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-3 py-2.5 transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check-In</p>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-500 shrink-0" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full min-w-0 text-sm font-bold text-slate-800 bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="flex-1 min-w-0 border border-slate-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-3 py-2.5 transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check-Out</p>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-500 shrink-0" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split("T")[0]}
              className="w-full min-w-0 text-sm font-bold text-slate-800 bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Guests & Rooms */}
        <div className="flex-1 min-w-0 relative">
          <button
            onClick={() => setShowGuestDrop(!showGuestDrop)}
            className="w-full text-left border border-slate-200 hover:border-blue-400 rounded-xl px-3 py-2.5 transition-all"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Guests & Rooms</p>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-blue-500 shrink-0" />
              <span className="text-sm font-bold text-slate-800 truncate">
                {guests} Guest{guests > 1 ? "s" : ""}
              </span>
              <ChevronDown size={12} className="text-slate-400 ml-auto shrink-0" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 pl-5">
              {rooms} Room{rooms > 1 ? "s" : ""}
            </p>
          </button>

          {showGuestDrop && (
            <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 w-60 z-50">
              {[
                { label: "Guests", value: guests, set: setGuests, min: 1, max: 10 },
                { label: "Rooms", value: rooms, set: setRooms, min: 1, max: 5 },
              ].map(({ label, value, set, min, max }) => (
                <div key={label} className="flex items-center justify-between mb-4 last:mb-0">
                  <span className="font-medium text-slate-700 text-sm">{label}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => set(Math.max(min, value - 1))}
                      className="w-7 h-7 rounded-full border border-slate-300 hover:border-blue-500 flex items-center justify-center text-slate-600 hover:text-blue-600 text-lg leading-none transition-colors"
                    >−</button>
                    <span className="w-5 text-center font-bold text-slate-800 text-sm">{value}</span>
                    <button
                      onClick={() => set(Math.min(max, value + 1))}
                      className="w-7 h-7 rounded-full border border-slate-300 hover:border-blue-500 flex items-center justify-center text-slate-600 hover:text-blue-600 text-lg leading-none transition-colors"
                    >+</button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowGuestDrop(false)}
                className="mt-4 w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleSearch}
          className="flex items-center gap-2.5 px-10 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Search size={16} />
          Search Hotels
        </button>
      </div>
    </div>
  );
}
