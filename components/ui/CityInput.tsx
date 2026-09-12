"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

/**
 * Destination field with suggestions.
 *
 * Suggestions come from cities that actually have a published property, so a
 * suggestion can never lead to an empty result set. Shared by the homepage hero
 * and the search-results bar so both behave the same way.
 */
export default function CityInput({
  value,
  onChange,
  cities = [],
  label = "Destination",
  placeholder = "City, hotel name, or area",
  hint,
  onSubmit,
  inputId = "destination",
}: {
  value: string;
  onChange: (value: string) => void;
  cities?: string[];
  label?: string;
  placeholder?: string;
  hint?: string;
  /** Enter with no suggestion list open runs the search. */
  onSubmit?: () => void;
  inputId?: string;
}) {
  const [open, setOpen] = useState(false);

  const query = value.trim().toLowerCase();
  const suggestions = (query ? cities.filter((c) => c.toLowerCase().includes(query)) : cities).slice(0, 6);
  const showing = open && suggestions.length > 0;

  return (
    <div className="relative min-w-0">
      <div className="border border-slate-200 hover:border-brand-400 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 rounded-xl px-3 py-2.5 transition-all bg-white">
        <label
          htmlFor={inputId}
          className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1"
        >
          {label}
        </label>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-brand-500 shrink-0" aria-hidden="true" />
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Enter" && !showing) onSubmit?.();
            }}
            role="combobox"
            aria-expanded={showing}
            aria-controls={`${inputId}-suggestions`}
            aria-autocomplete="list"
            placeholder={placeholder}
            className="w-full text-sm font-bold text-slate-800 bg-transparent focus:outline-none placeholder-slate-300"
          />
        </div>
        {hint && <p className="text-[11px] text-slate-400 mt-0.5 pl-5">{hint}</p>}
      </div>

      {showing && (
        <ul
          id={`${inputId}-suggestions`}
          role="listbox"
          className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 max-h-64 overflow-y-auto"
        >
          {!query && (
            <li className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Popular destinations
            </li>
          )}
          {suggestions.map((city) => (
            <li key={city}>
              <button
                type="button"
                role="option"
                aria-selected={value === city}
                // Fires before the input's blur, so the click is not lost.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(city);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
              >
                <MapPin size={13} className="text-slate-300 shrink-0" aria-hidden="true" />
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
