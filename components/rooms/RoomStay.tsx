"use client";

import {
  createContext, useContext, useEffect, useMemo, useState, useTransition, type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, Plus } from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import { addOnIcon } from "@/lib/utils/room-info";
import { formatCurrency } from "@/lib/utils/formatters";
import type { RoomOffer } from "@/lib/services/public-hotels";

const GOLD = "text-[#b08d57]";

/** The add-ons a guest has ticked, shared between the list and the price card. */
const ChosenContext = createContext<{
  chosen: string[];
  toggle: (code: string) => void;
} | null>(null);

function useChosen() {
  const ctx = useContext(ChosenContext);
  if (!ctx) throw new Error("Room add-ons must sit inside <RoomStayProvider>.");
  return ctx;
}

export function RoomStayProvider({ children }: { children: ReactNode }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const value = useMemo(
    () => ({
      chosen,
      toggle: (code: string) =>
        setChosen((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code])),
    }),
    [chosen],
  );
  return <ChosenContext.Provider value={value}>{children}</ChosenContext.Provider>;
}

/** Breakfast, airport pickup and the rest — whatever the property has priced up. */
export function AddOnList({ options, nights }: { options: RoomOffer["options"]; nights: number }) {
  const { chosen, toggle } = useChosen();
  if (options.length === 0) return null;

  return (
    <section aria-labelledby="add-ons">
      <h2 id="add-ons" className="text-2xl font-semibold tracking-tight mb-6">
        Add to your stay
      </h2>
      <ul className="space-y-3">
        {options.map((option) => {
          const on = chosen.includes(option.code);
          const Icon = addOnIcon(option.label);
          return (
            <li key={option.code}>
              <label
                className={`flex items-center gap-4 border rounded-xl px-4 py-3.5 cursor-pointer transition-colors ${
                  on ? "border-stone-800 bg-stone-50" : "border-stone-300 hover:border-stone-500"
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(option.code)}
                  className="sr-only peer"
                />
                <Icon size={26} strokeWidth={1.1} className={`${GOLD} shrink-0`} aria-hidden="true" />
                <span className="flex-1 min-w-0">
                  <span className="block">{option.label}</span>
                  {option.description && (
                    <span className="block text-sm text-stone-500">{option.description}</span>
                  )}
                </span>
                <span className="text-right shrink-0">
                  <span className="block tabular-nums">+ {formatCurrency(option.price)}</span>
                  <span className="block text-xs text-stone-500">
                    {option.per === "night" ? `per night · ${nights} night${nights === 1 ? "" : "s"}` : "one-off"}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`w-6 h-6 border rounded-md flex items-center justify-center shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-stone-800 ${
                    on ? "bg-secondary-500 border-secondary-500 text-white" : "border-stone-400 text-stone-400"
                  }`}
                >
                  {on ? <Check size={14} strokeWidth={2.5} /> : <Plus size={14} />}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const DAY = 86_400_000;

function shiftDay(iso: string, days: number): string {
  return new Date(new Date(`${iso}T00:00:00.000Z`).getTime() + days * DAY).toISOString().slice(0, 10);
}

interface Selection {
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
}

const FIELD =
  "w-full flex items-center justify-between gap-3 border border-stone-400 hover:border-stone-800 rounded-xl px-3.5 py-3 transition-colors focus-within:border-stone-800";

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  format = (n) => String(n),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  format?: (n: number) => string;
}) {
  const options = Array.from({ length: Math.max(0, max - min + 1) }, (_, i) => min + i);
  return (
    <label className={`${FIELD} relative`}>
      <span>{label}</span>
      <span className="flex items-center gap-2 text-sm tabular-nums">
        {format(value)}
        <ChevronDown size={14} className="text-stone-400" aria-hidden="true" />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={options.length <= 1}
        aria-label={label}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
      >
        {options.map((n) => (
          <option key={n} value={n}>
            {format(n)}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Pricing for the chosen dates and party, with the ticked add-ons folded in. */
export function BookingCard({
  roomName,
  roomId,
  offer,
  totalUnits,
  maxAdults,
  maxChildren,
  initial,
  minDate,
}: {
  roomName: string;
  roomId: string;
  offer: RoomOffer | null;
  totalUnits: number;
  maxAdults: number;
  maxChildren: number;
  initial: Selection;
  minDate: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const { chosen } = useChosen();
  const [sel, setSel] = useState<Selection>(initial);

  const maxRooms = Math.max(1, Math.min(10, totalUnits));

  function update(patch: Partial<Selection>) {
    const next = { ...sel, ...patch };
    if (next.checkOut <= next.checkIn) next.checkOut = shiftDay(next.checkIn, 1);
    next.rooms = Math.min(Math.max(1, next.rooms), maxRooms);
    next.adults = Math.min(Math.max(1, next.adults), Math.min(30, maxAdults * next.rooms));
    next.children = Math.min(next.children, maxChildren * next.rooms);
    setSel(next);

    const query = new URLSearchParams({
      checkIn: next.checkIn,
      checkOut: next.checkOut,
      rooms: String(next.rooms),
      adults: String(next.adults),
      children: String(next.children),
    });
    startTransition(() => router.replace(`${pathname}?${query}`, { scroll: false }));
  }

  const extras = (offer?.options ?? []).filter((o) => chosen.includes(o.code));
  const extrasTotal = extras.reduce((sum, o) => sum + o.amount, 0);
  const total = (offer?.total ?? 0) + extrasTotal;
  const nights = offer?.nights ?? 0;

  const bookHref = {
    pathname: "/book/hotel/start",
    query: {
      roomId,
      checkIn: sel.checkIn,
      checkOut: sel.checkOut,
      guests: sel.adults,
      children: sel.children,
      rooms: sel.rooms,
      ...(chosen.length ? { options: chosen.join(",") } : {}),
    },
  };

  return (
    <div id="reserve" className="scroll-mt-20 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-[45px] max-sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[28px] leading-tight uppercase font-semibold tracking-tight">
          Reserve:
        </h2>
        {offer && (
          <p className="text-sm whitespace-nowrap tabular-nums">
            From {formatCurrency(offer.nightlyAverage)} /night
          </p>
        )}
      </div>
      <p className="text-sm text-stone-500 mt-1">{roomName}</p>

      <div className="mt-8 space-y-3">
        <DatePicker
          variant="row"
          label="Check In"
          value={sel.checkIn}
          min={minDate}
          onChange={(v) => update({ checkIn: v })}
          containerClassName="relative"
        />
        <DatePicker
          variant="row"
          label="Check Out"
          value={sel.checkOut}
          min={shiftDay(sel.checkIn, 1)}
          onChange={(v) => update({ checkOut: v })}
          containerClassName="relative"
        />
        <Stepper
          label="Rooms"
          value={sel.rooms}
          min={1}
          max={maxRooms}
          onChange={(rooms) => update({ rooms })}
          format={(n) => `${n} Room${n === 1 ? "" : "s"}`}
        />
        <div className="grid grid-cols-2 gap-3">
          <Stepper
            label="Adults"
            value={sel.adults}
            min={1}
            max={Math.min(30, maxAdults * sel.rooms)}
            onChange={(adults) => update({ adults })}
          />
          <Stepper
            label="Children"
            value={sel.children}
            min={0}
            max={maxChildren * sel.rooms}
            onChange={(children) => update({ children })}
          />
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-stone-200">
        {offer && (
          <dl className="mb-5 space-y-2 text-sm text-stone-600">
            <div className="flex justify-between gap-4">
              <dt>
                {formatCurrency(offer.nightlyAverage)} × {nights} night{nights === 1 ? "" : "s"}
                {sel.rooms > 1 ? ` × ${sel.rooms} rooms` : ""}
              </dt>
              <dd className="tabular-nums">{formatCurrency(offer.total)}</dd>
            </div>
            {extras.map((o) => (
              <div key={o.code} className="flex justify-between gap-4">
                <dt>{o.label}</dt>
                <dd className="tabular-nums">+ {formatCurrency(o.amount)}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="flex items-center justify-between gap-4 pt-5 border-t border-stone-200">
          <span className="text-2xl font-semibold tracking-tight">Total Cost</span>
          <span
            className={`text-xl tabular-nums transition-opacity ${pending ? "opacity-40" : ""}`}
            aria-live="polite"
          >
            {offer ? formatCurrency(total) : "—"}
          </span>
        </div>
      </div>

      {offer && !offer.available && offer.reason && (
        <p className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          {offer.reason}
        </p>
      )}
      {offer?.available && offer.unitsLeft <= 3 && (
        <p className="mt-4 text-sm text-amber-800">Only {offer.unitsLeft} left for these dates.</p>
      )}

      {offer?.available ? (
        <Link
          href={bookHref}
          className="mt-8 block text-center bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-3.5 rounded-xl transition-colors"
        >
          Book Your Stay Now
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="mt-8 block text-center bg-stone-200 text-stone-500 py-3.5 rounded-xl cursor-not-allowed"
        >
          {offer?.heldOnly ? "Held — try again shortly" : "Unavailable for these dates"}
        </span>
      )}
    </div>
  );
}

/**
 * On a phone the Reserve card sits at the bottom of the page, so a guest who has
 * read everything would otherwise have to scroll to find it. This bar keeps the
 * price and a way to it in view until the card itself comes into sight.
 */
export function MobileReserveBar({ nightly }: { nightly: number | null }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const card = document.getElementById("reserve");
    if (!card) return;
    const observer = new IntersectionObserver(([entry]) => {
      // Only while the card is still below the screen — once it has been
      // reached or passed, the bar would just cover the footer.
      setShow(!entry.isIntersecting && entry.boundingClientRect.top > 0);
    });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  if (!show) return null;

  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-4">
      <div>
        {nightly !== null && (
          <>
            <p className="text-xs text-stone-500">From</p>
            <p className="font-semibold tabular-nums">
              {formatCurrency(nightly)} <span className="text-xs font-normal text-stone-500">/ night</span>
            </p>
          </>
        )}
      </div>
      <a
        href="#reserve"
        className="bg-secondary-500 hover:bg-secondary-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        Reserve
      </a>
    </div>
  );
}
