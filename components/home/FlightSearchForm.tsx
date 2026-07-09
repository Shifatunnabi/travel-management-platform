"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plane, ArrowLeftRight, Users,
  ChevronDown, Search, MapPin, Plus, X,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";

type TripType = "one-way" | "round-trip" | "multi-city";
const cabinClasses = ["Economy", "Business"];

const tripTypeLabels: Record<TripType, string> = {
  "one-way": "One Way",
  "round-trip": "Round Trip",
  "multi-city": "Multi-City",
};

interface Leg {
  from: string;
  to: string;
  departure: string;
}

let legIdCounter = 0;
function newLeg(): Leg & { key: number } {
  legIdCounter += 1;
  return { key: legIdCounter, from: "", to: "", departure: "" };
}

const today = new Date().toISOString().split("T")[0];

export default function FlightSearchForm() {
  const router = useRouter();
  const [tripType, setTripType] = useState<TripType>("one-way");

  // one-way / round-trip state
  const [from, setFrom] = useState("Dhaka");
  const [fromCode] = useState("DAC");
  const [to, setTo] = useState("");
  const [toCode, setToCode] = useState("");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // multi-city state
  const [legs, setLegs] = useState<(Leg & { key: number })[]>(() => [newLeg(), newLeg()]);

  // passengers
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState("Economy");
  const [showPaxDrop, setShowPaxDrop] = useState(false);

  const totalTravelers = adults + children;

  const updateAdults = (val: number) => {
    const next = Math.max(1, Math.min(9, val));
    setAdults(next);
    setInfants((inf) => Math.min(inf, next));
  };

  const swap = () => {
    const tempCity = from;
    setFrom(to || ""); setToCode(fromCode);
    setTo(tempCity);
  };

  const updateLeg = (key: number, field: keyof Leg, value: string) => {
    setLegs((prev) => prev.map((leg) => (leg.key === key ? { ...leg, [field]: value } : leg)));
  };

  const addLeg = () => {
    if (legs.length < 5) setLegs((prev) => [...prev, newLeg()]);
  };

  const removeLeg = (key: number) => {
    if (legs.length > 2) setLegs((prev) => prev.filter((leg) => leg.key !== key));
  };

  const handleSearch = () => {
    const p = new URLSearchParams({
      passengers: String(adults + children + infants),
      adults: String(adults),
      children: String(children),
      infants: String(infants),
      cabinClass, tripType,
    });
    if (tripType === "multi-city") {
      legs.forEach((leg, i) => {
        p.set(`from${i + 1}`, leg.from);
        p.set(`to${i + 1}`, leg.to);
        p.set(`departure${i + 1}`, leg.departure);
      });
    } else {
      p.set("from", fromCode || from);
      p.set("to", toCode || to);
      p.set("departure", departure);
      p.set("returnDate", returnDate);
    }
    router.push(`/flights/search?${p}`);
  };

  const renderPassengerPicker = (containerClassName: string, panelAlign: "left-0" | "right-0") => (
    <div className={containerClassName}>
      <button
        type="button"
        onClick={() => setShowPaxDrop(!showPaxDrop)}
        className="w-full text-left border border-slate-200 hover:border-blue-400 rounded-xl px-3 py-2.5 transition-all"
      >
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Traveler, Class</p>
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-blue-500 shrink-0" />
          <span className="text-sm font-bold text-slate-800 truncate">
            {totalTravelers} Traveler{totalTravelers > 1 ? "s" : ""}
          </span>
          <ChevronDown size={12} className="text-slate-400 ml-auto shrink-0" />
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5 pl-5">{cabinClass}</p>
      </button>

      {showPaxDrop && (
        <div className={`absolute top-full mt-2 ${panelAlign} bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 w-72 z-50`}>
          <div className="space-y-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 text-sm">Adults</p>
                <p className="text-xs text-slate-400">12 years and above</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateAdults(adults - 1)}
                  className="w-7 h-7 rounded-full border border-slate-300 hover:border-blue-500 flex items-center justify-center text-slate-600 hover:text-blue-600 text-lg leading-none transition-colors"
                >−</button>
                <span className="w-5 text-center font-bold text-blue-600 text-sm">{adults}</span>
                <button
                  type="button"
                  onClick={() => updateAdults(adults + 1)}
                  className="w-7 h-7 rounded-full border border-slate-300 hover:border-blue-500 flex items-center justify-center text-slate-600 hover:text-blue-600 text-lg leading-none transition-colors"
                >+</button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 text-sm">Children</p>
                <p className="text-xs text-slate-400">2–11 years</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setChildren((c) => Math.max(0, c - 1))}
                  className="w-7 h-7 rounded-full border border-slate-300 hover:border-blue-500 flex items-center justify-center text-slate-600 hover:text-blue-600 text-lg leading-none transition-colors"
                >−</button>
                <span className="w-5 text-center font-bold text-blue-600 text-sm">{children}</span>
                <button
                  type="button"
                  onClick={() => setChildren((c) => Math.min(8, c + 1))}
                  className="w-7 h-7 rounded-full border border-slate-300 hover:border-blue-500 flex items-center justify-center text-slate-600 hover:text-blue-600 text-lg leading-none transition-colors"
                >+</button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 text-sm">Infants</p>
                <p className="text-xs text-slate-400">Below 2 years</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInfants((i) => Math.max(0, i - 1))}
                  className="w-7 h-7 rounded-full border border-slate-300 hover:border-blue-500 flex items-center justify-center text-slate-600 hover:text-blue-600 text-lg leading-none transition-colors"
                >−</button>
                <span className="w-5 text-center font-bold text-blue-600 text-sm">{infants}</span>
                <button
                  type="button"
                  onClick={() => setInfants((i) => Math.min(adults, i + 1))}
                  className="w-7 h-7 rounded-full border border-slate-300 hover:border-blue-500 flex items-center justify-center text-slate-600 hover:text-blue-600 text-lg leading-none transition-colors"
                >+</button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cabin Class</p>
            <div className="grid grid-cols-2 gap-2">
              {cabinClasses.map((cls) => (
                <button
                  type="button"
                  key={cls}
                  onClick={() => setCabinClass(cls)}
                  className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    cabinClass === cls ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      cabinClass === cls ? "border-blue-600" : "border-slate-300"
                    }`}
                  >
                    {cabinClass === cls && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                  </span>
                  {cls}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPaxDrop(false)}
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-5 sm:p-6">
      {/* Trip type radios */}
      <div className="flex items-center gap-5 mb-4 flex-wrap">
        {(["one-way", "round-trip", "multi-city"] as TripType[]).map((type) => (
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
              {tripTypeLabels[type]}
            </span>
          </label>
        ))}
      </div>

      {tripType !== "multi-city" ? (
        <>
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
            <DatePicker
              label="Departure"
              value={departure}
              onChange={setDeparture}
              min={today}
              containerClassName="flex-1 min-w-0 relative"
            />

            {/* Return date / Add return */}
            {tripType === "round-trip" ? (
              <DatePicker
                label="Return"
                value={returnDate}
                onChange={setReturnDate}
                min={departure || today}
                containerClassName="flex-1 min-w-0 relative"
              />
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
            {renderPassengerPicker("flex-1 min-w-0 relative", "right-0")}
          </div>
        </>
      ) : (
        <>
          {/* Multi-city legs */}
          <div className="space-y-2 mb-2">
            {legs.map((leg, i) => (
              <div key={leg.key} className="flex items-stretch gap-2">
                <div className="flex-1 min-w-0 border border-slate-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-3 py-2.5 transition-all">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Flight {i + 1} — From
                  </p>
                  <div className="flex items-center gap-2">
                    <Plane size={14} className="text-blue-500 shrink-0" />
                    <input
                      type="text"
                      value={leg.from}
                      onChange={(e) => updateLeg(leg.key, "from", e.target.value)}
                      placeholder="Departure city"
                      className="w-full min-w-0 text-sm font-bold text-slate-800 bg-transparent focus:outline-none placeholder-slate-300 truncate"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0 border border-slate-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-3 py-2.5 transition-all">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">To</p>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500 shrink-0" />
                    <input
                      type="text"
                      value={leg.to}
                      onChange={(e) => updateLeg(leg.key, "to", e.target.value)}
                      placeholder="Destination city"
                      className="w-full min-w-0 text-sm font-bold text-slate-800 bg-transparent focus:outline-none placeholder-slate-300 truncate"
                    />
                  </div>
                </div>

                <DatePicker
                  label="Departure"
                  value={leg.departure}
                  onChange={(v) => updateLeg(leg.key, "departure", v)}
                  min={today}
                  containerClassName="flex-1 min-w-0 relative"
                />

                {legs.length > 2 && (
                  <button
                    onClick={() => removeLeg(leg.key)}
                    aria-label="Remove flight"
                    className="shrink-0 self-center w-8 h-8 rounded-full border-2 border-slate-200 bg-white hover:border-red-400 hover:bg-red-50 flex items-center justify-center transition-all shadow-sm"
                  >
                    <X size={14} className="text-slate-500" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-2">
            {legs.length < 5 && (
              <button
                onClick={addLeg}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 px-1 py-1.5"
              >
                <Plus size={15} /> Add another flight
              </button>
            )}
          </div>

          {/* Passengers & Class */}
          {renderPassengerPicker("relative max-w-xs", "left-0")}
        </>
      )}

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
