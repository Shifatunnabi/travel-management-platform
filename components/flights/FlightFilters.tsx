"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface FilterState {
  stops: number[];
  refundable: boolean | null;
  priceMin: number;
  priceMax: number;
  airlines: string[];
}

const airlineOptions = [
  "Biman Bangladesh Airlines",
  "US-Bangla Airlines",
  "Novoair",
  "Emirates",
  "Air Arabia",
];

const stopOptions = [
  { value: 0, label: "Direct" },
  { value: 1, label: "1 Stop" },
  { value: 2, label: "2+ Stops" },
];

interface FlightFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
}

export default function FlightFilters({ onFilterChange }: FlightFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    stops: [],
    refundable: null,
    priceMin: 0,
    priceMax: 100000,
    airlines: [],
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (patch: Partial<FilterState>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onFilterChange?.(next);
  };

  const toggleStop = (v: number) => {
    const stops = filters.stops.includes(v)
      ? filters.stops.filter((s) => s !== v)
      : [...filters.stops, v];
    update({ stops });
  };

  const toggleAirline = (name: string) => {
    const airlines = filters.airlines.includes(name)
      ? filters.airlines.filter((a) => a !== name)
      : [...filters.airlines, name];
    update({ airlines });
  };

  const activeCount = filters.stops.length + filters.airlines.length + (filters.refundable !== null ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Reset */}
      {activeCount > 0 && (
        <button
          onClick={() => update({ stops: [], refundable: null, airlines: [], priceMin: 0, priceMax: 100000 })}
          className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
        >
          <X size={12} /> Reset all filters
        </button>
      )}

      {/* Stops */}
      <div>
        <h3 className="font-semibold text-slate-800 text-sm mb-3">Stops</h3>
        <div className="space-y-2">
          {stopOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.stops.includes(opt.value)}
                onChange={() => toggleStop(opt.value)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-semibold text-slate-800 text-sm mb-3">
          Price Range
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-slate-500">
            <span>৳{filters.priceMin.toLocaleString()}</span>
            <span>৳{filters.priceMax.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100000}
            step={500}
            value={filters.priceMax}
            onChange={(e) => update({ priceMax: Number(e.target.value) })}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      {/* Refundable */}
      <div>
        <h3 className="font-semibold text-slate-800 text-sm mb-3">Ticket Type</h3>
        <div className="space-y-2">
          {[
            { val: true, label: "Refundable" },
            { val: false, label: "Non-Refundable" },
          ].map(({ val, label }) => (
            <label key={label} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="refundable"
                checked={filters.refundable === val}
                onChange={() => update({ refundable: filters.refundable === val ? null : val })}
                className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Airlines */}
      <div>
        <h3 className="font-semibold text-slate-800 text-sm mb-3">Airlines</h3>
        <div className="space-y-2">
          {airlineOptions.map((airline) => (
            <label key={airline} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.airlines.includes(airline)}
                onChange={() => toggleAirline(airline)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 leading-tight">{airline}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-xl font-semibold text-sm"
      >
        <SlidersHorizontal size={16} />
        Filters{activeCount > 0 && ` (${activeCount})`}
      </button>

      {/* Mobile sheet */}
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
            <button
              onClick={() => setMobileOpen(false)}
              className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
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
