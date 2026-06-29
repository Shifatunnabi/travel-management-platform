"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Calendar, Users,
  Building2, SortAsc, ChevronDown,
} from "lucide-react";
import HotelCard from "./HotelCard";
import HotelFilters from "./HotelFilters";
import { mockHotels } from "@/lib/mock-data";

const sortOptions = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviewed" },
];

export default function HotelSearchResults() {
  const params = useSearchParams();
  const destination = params.get("destination") || "Cox's Bazar";
  const checkIn = params.get("checkIn") || "2026-07-04";
  const checkOut = params.get("checkOut") || "2026-07-06";
  const guests = params.get("guests") || "2";
  const rooms = params.get("rooms") || "1";

  const [sort, setSort] = useState("price-asc");
  const [showSort, setShowSort] = useState(false);

  const hotels = [...mockHotels].sort((a, b) => {
    if (sort === "price-asc") return a.pricePerNight - b.pricePerNight;
    if (sort === "price-desc") return b.pricePerNight - a.pricePerNight;
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "reviews") return b.reviewCount - a.reviewCount;
    return 0;
  });

  return (
    <div>
      {/* Search summary */}
      <div className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm transition-colors">
              <ArrowLeft size={15} />
              Back
            </Link>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
              <div className="flex items-center gap-2 bg-blue-800 rounded-xl px-4 py-2">
                <MapPin size={14} />
                <span className="font-bold">{destination}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-200">
                <Calendar size={14} />
                <span>{checkIn} → {checkOut}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-200">
                <Users size={14} />
                <span>{guests} Guests · {rooms} Room{parseInt(rooms) > 1 ? "s" : ""}</span>
              </div>
              <Link href="/" className="ml-auto text-xs text-blue-300 hover:text-white underline">
                Modify search
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <HotelFilters />

          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-bold text-slate-900 text-lg">
                  {hotels.length} hotels found
                </h1>
                <p className="text-slate-500 text-sm">{destination} · {checkIn} to {checkOut}</p>
              </div>
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

            {/* Quick filters */}
            <div className="flex flex-wrap gap-2 mb-5">
              {["★★★★★ 5-star", "Free Breakfast", "Free Cancellation", "Pool", "Under ৳10,000"].map((chip) => (
                <button
                  key={chip}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Hotel cards */}
            <div className="space-y-4">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>

            {hotels.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <Building2 size={40} className="text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 text-lg mb-1">No hotels found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your filters or search for different dates</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
