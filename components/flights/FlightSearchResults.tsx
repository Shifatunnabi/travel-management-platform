"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft, ArrowLeftRight, Calendar, Users,
  Plane, SortAsc, ChevronDown,
} from "lucide-react";
import Link from "next/link";
import FlightCard from "./FlightCard";
import FlightFilters from "./FlightFilters";
import { mockFlights } from "@/lib/mock-data";

const sortOptions = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "duration", label: "Shortest Duration" },
  { value: "departure", label: "Earliest Departure" },
];

export default function FlightSearchResults() {
  const params = useSearchParams();
  const from = params.get("from") || "DAC";
  const to = params.get("to") || "CXB";
  const departure = params.get("departure") || "2026-07-04";
  const passengers = params.get("passengers") || "1";
  const cabinClass = params.get("cabinClass") || "Economy";
  const tripType = params.get("tripType") || "one-way";

  const [sort, setSort] = useState("price-asc");
  const [showSort, setShowSort] = useState(false);

  const flights = [...mockFlights].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return 0;
  });

  return (
    <div>
      {/* Search summary bar */}
      <div className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft size={15} />
              Back
            </Link>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
              <div className="flex items-center gap-2 bg-blue-800 rounded-xl px-4 py-2">
                <span className="font-bold">{from}</span>
                <ArrowLeftRight size={14} className="text-blue-300" />
                <span className="font-bold">{to}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-200">
                <Calendar size={14} />
                <span>{departure}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-200">
                <Users size={14} />
                <span>{passengers} Passenger{parseInt(passengers) > 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-200">
                <Plane size={14} />
                <span>{cabinClass}</span>
              </div>
              <Link
                href="/"
                className="ml-auto text-xs text-blue-300 hover:text-white underline"
              >
                Modify search
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Results area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Filters sidebar */}
          <FlightFilters />

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-bold text-slate-900 text-lg">
                  {flights.length} flights found
                </h1>
                <p className="text-slate-500 text-sm">
                  {from} → {to} · {departure}
                </p>
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-blue-400 rounded-xl text-sm font-medium text-slate-700 transition-colors"
                >
                  <SortAsc size={15} className="text-blue-500" />
                  {sortOptions.find((s) => s.value === sort)?.label || "Sort"}
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-20 min-w-52">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSort(opt.value); setShowSort(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sort === opt.value
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick filter chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              {["Direct", "Refundable", "Under ৳5,000", "Under ৳10,000"].map((chip) => (
                <button
                  key={chip}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Flight cards */}
            <div className="space-y-4">
              {flights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>

            {/* Empty state */}
            {flights.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <Plane size={40} className="text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 text-lg mb-1">No flights found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your filters or search for different dates</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
