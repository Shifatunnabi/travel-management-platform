"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plane, ArrowLeftRight, Calendar, Users,
  ChevronDown, Search, MapPin,
} from "lucide-react";

type TripType = "one-way" | "round-trip";
const cabinClasses = ["Economy", "Business", "First Class"];

export default function FlightSearchForm() {
  const router = useRouter();
  const [tripType, setTripType] = useState<TripType>("one-way");
  const [from, setFrom] = useState("Dhaka");
  const [fromCode] = useState("DAC");
  const [to, setTo] = useState("");
  const [toCode, setToCode] = useState("");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState("Economy");
  const [showPaxDrop, setShowPaxDrop] = useState(false);

  const swap = () => {
    const tempCity = from; const tempCode = fromCode;
    setFrom(to || ""); setToCode(fromCode);
    setTo(tempCity);
  };

  const handleSearch = () => {
    const p = new URLSearchParams({
      from: fromCode || from, to: toCode || to,
      departure, returnDate,
      passengers: String(passengers), cabinClass, tripType,
    });
    router.push(`/flights/search?${p}`);
  };

  return (
    <div className="p-5 sm:p-6">
      {/* Trip type radios */}
      <div className="flex items-center gap-5 mb-4">
        {(["one-way", "round-trip"] as TripType[]).map((type) => (
          <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
            <span
              onClick={() => setTripType(type)}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                tripType === type ? "border-blue-600" : "border-slate-300"
              }`}
            >
              {tripType === type && (
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              )}
            </span>
            <span
              onClick={() => setTripType(type)}
              className="text-sm font-medium text-slate-700"
            >
              {type === "one-way" ? "One Way" : "Round Trip"}
            </span>
          </label>
        ))}
      </div>

      {/* ── Row 1: FROM ⇄ TO ─────────────────────────────── */}
      <div className="flex items-stretch gap-2 mb-2">
        {/* FROM */}
        <div className="flex-1 min-w-0 border border-slate-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-3 py-2.5 transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">From</p>
          <div className="flex items-center gap-2">
            <Plane size={14} className="text-blue-500 shrink-0" />
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Departure city"
              className="w-full min-w-0 text-sm font-bold text-slate-800 bg-transparent focus:outline-none placeholder-slate-300 truncate"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate pl-5">
            {fromCode ? `${fromCode} — Hazrat Shahjalal Intl.` : "Search airport"}
          </p>
        </div>

        {/* Swap */}
        <div className="flex items-center shrink-0 self-center">
          <button
            onClick={swap}
            aria-label="Swap cities"
            className="w-8 h-8 rounded-full border-2 border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center transition-all shadow-sm"
          >
            <ArrowLeftRight size={13} className="text-blue-500" />
          </button>
        </div>

        {/* TO */}
        <div className="flex-1 min-w-0 border border-slate-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-3 py-2.5 transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">To</p>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-blue-500 shrink-0" />
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Destination city"
              className="w-full min-w-0 text-sm font-bold text-slate-800 bg-transparent focus:outline-none placeholder-slate-300 truncate"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 pl-5 truncate">
            {toCode ? `${toCode} — Airport` : "e.g. Cox's Bazar"}
          </p>
        </div>
      </div>

      {/* ── Row 2: Dates | Passengers ────────────────────── */}
      <div className="flex items-stretch gap-2">
        {/* Departure date */}
        <div className="flex-1 min-w-0 border border-slate-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-3 py-2.5 transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Departure</p>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-500 shrink-0" />
            <input
              type="date"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full min-w-0 text-sm font-bold text-slate-800 bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Return date / Add return */}
        {tripType === "round-trip" ? (
          <div className="flex-1 min-w-0 border border-slate-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-3 py-2.5 transition-all">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Return</p>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-blue-500 shrink-0" />
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={departure || new Date().toISOString().split("T")[0]}
                className="w-full min-w-0 text-sm font-bold text-slate-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setTripType("round-trip")}
            className="flex-1 min-w-0 border border-dashed border-blue-300 rounded-xl px-3 py-2.5 bg-blue-50/50 hover:bg-blue-50 transition-all text-left"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Return</p>
            <p className="text-sm text-blue-500 font-semibold">+ Add return</p>
            <p className="text-[11px] text-slate-400">Save on round trips</p>
          </button>
        )}

        {/* Passengers & Class */}
        <div className="flex-1 min-w-0 relative">
          <button
            onClick={() => setShowPaxDrop(!showPaxDrop)}
            className="w-full text-left border border-slate-200 hover:border-blue-400 rounded-xl px-3 py-2.5 transition-all"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Traveler, Class</p>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-blue-500 shrink-0" />
              <span className="text-sm font-bold text-slate-800 truncate">
                {passengers} Traveler{passengers > 1 ? "s" : ""}
              </span>
              <ChevronDown size={12} className="text-slate-400 ml-auto shrink-0" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 pl-5">{cabinClass}</p>
          </button>

          {showPaxDrop && (
            <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 w-64 z-50">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-slate-800 text-sm">Passengers</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    className="w-7 h-7 rounded-full border border-slate-300 hover:border-blue-500 flex items-center justify-center text-slate-600 hover:text-blue-600 text-lg leading-none transition-colors"
                  >−</button>
                  <span className="w-5 text-center font-bold text-slate-800 text-sm">{passengers}</span>
                  <button
                    onClick={() => setPassengers(Math.min(9, passengers + 1))}
                    className="w-7 h-7 rounded-full border border-slate-300 hover:border-blue-500 flex items-center justify-center text-slate-600 hover:text-blue-600 text-lg leading-none transition-colors"
                  >+</button>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cabin Class</p>
                {cabinClasses.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => { setCabinClass(cls); setShowPaxDrop(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      cabinClass === cls ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowPaxDrop(false)}
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
          Search Flights
        </button>
      </div>
    </div>
  );
}
