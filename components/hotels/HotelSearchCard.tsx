"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Users, BedDouble, type LucideIcon } from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import CityInput from "@/components/ui/CityInput";
import { todayISO } from "@/lib/utils/formatters";

/**
 * The location/dates/rooms/guests card. Rendered twice: pinned above the
 * filters on desktop, and inside a popup on mobile (from the header's
 * "Modify search" button) — same fields, same submit logic either way.
 */
export default function HotelSearchCard({
  destination,
  checkIn,
  checkOut,
  guests,
  rooms,
  cities,
  onSubmit,
}: {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  rooms: string;
  cities: string[];
  /** Fires after the URL is updated — lets the mobile popup close itself. */
  onSubmit?: () => void;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const today = todayISO();

  const [dest, setDest] = useState(destination);
  const [from, setFrom] = useState(checkIn);
  const [to, setTo] = useState(checkOut);
  const [people, setPeople] = useState(Number(guests) || 2);
  const [units, setUnits] = useState(Number(rooms) || 1);

  const submit = () => {
    // Start from the current URL so star/price/amenity filters and sort survive.
    const next = new URLSearchParams(search.toString());
    if (dest.trim()) next.set("destination", dest.trim());
    else next.delete("destination");
    if (from) next.set("checkIn", from);
    if (to) next.set("checkOut", to);
    next.set("guests", String(people));
    next.set("rooms", String(units));
    router.push(`/hotels/search?${next}`);
    onSubmit?.();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h2 className="font-bold text-slate-900 text-sm mb-4">Search hotels</h2>
      <div className="flex flex-col gap-3">
        <CityInput
          value={dest}
          onChange={setDest}
          cities={cities}
          onSubmit={submit}
          inputId="search-card-destination"
          label="Location"
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
        <CounterField label="Rooms" icon={BedDouble} value={units} min={1} max={5} onChange={setUnits} />
        <CounterField label="Guests" icon={Users} value={people} min={1} max={20} onChange={setPeople} />

        <button
          type="button"
          onClick={submit}
          className="w-full flex items-center justify-center gap-2 py-3 bg-secondary-500 hover:bg-secondary-600 text-white font-bold text-sm rounded-xl transition-colors"
        >
          <Search size={16} aria-hidden="true" />
          Check Availability
        </button>
      </div>
    </div>
  );
}

function CounterField({
  label,
  icon: Icon,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  icon: LucideIcon;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="border border-slate-200 rounded-xl px-3 py-2.5">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        <Icon size={14} className="text-brand-500 shrink-0" aria-hidden="true" />
        <span className="text-sm font-bold text-slate-800 truncate flex-1">
          {value} {label === "Guests" ? `Guest${value === 1 ? "" : "s"}` : `Room${value === 1 ? "" : "s"}`}
        </span>
        <div className="flex items-center gap-2 shrink-0">
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
    </div>
  );
}
