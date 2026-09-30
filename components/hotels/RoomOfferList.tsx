"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Bed, Maximize, Users, Coffee, ShieldCheck, XCircle, AlertCircle,
} from "lucide-react";
import { cdn } from "@/lib/utils/cdn";
import { slugify } from "@/lib/cache/tags";
import { formatCurrency } from "@/lib/utils/formatters";
import type { RoomOffer } from "@/lib/services/public-hotels";

interface RoomSummary {
  id: string;
  slug?: string;
  name: string;
  description: string;
  bedType: string;
  sizeSqm?: number;
  maxAdults: number;
  maxChildren: number;
  image?: string;
  amenities: string[];
}

export default function RoomOfferList({
  hotelSlug,
  hotelCity,
  items,
  nights,
  checkIn,
  checkOut,
  guests,
  rooms,
}: {
  hotelSlug: string;
  hotelCity: string;
  items: { room: RoomSummary; offer?: RoomOffer }[];
  nights: number;
  checkIn: string;
  checkOut: string;
  guests: string;
  rooms: string;
}) {
  return (
    <div className="space-y-4">
      {items.map(({ room, offer }) => (
        <RoomRow
          key={room.id}
          hotelSlug={hotelSlug}
          hotelCity={hotelCity}
          room={room}
          offer={offer}
          nights={nights}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          rooms={rooms}
        />
      ))}
    </div>
  );
}

function RoomRow({
  hotelSlug,
  hotelCity,
  room,
  offer,
  nights,
  checkIn,
  checkOut,
  guests,
  rooms,
}: {
  hotelSlug: string;
  hotelCity: string;
  room: RoomSummary;
  offer?: RoomOffer;
  nights: number;
  checkIn: string;
  checkOut: string;
  guests: string;
  rooms: string;
}) {
  const breakfast = Boolean(offer?.breakfast);
  const refundable = Boolean(offer?.refundable);
  const cancellationHours = offer?.cancellationHours ?? 0;

  const unitCount = Number(rooms) || 1;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {room.image ? (
          <Image
            src={cdn(room.image, 240, 180)}
            alt={room.name}
            width={120}
            height={90}
            className="w-full sm:w-32 h-24 sm:h-auto object-cover rounded-lg shrink-0"
          />
        ) : (
          <div className="w-full sm:w-32 h-24 bg-slate-100 rounded-lg shrink-0" aria-hidden="true" />
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900">{room.name}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Bed size={12} aria-hidden="true" /> {room.bedType}
            </span>
            {room.sizeSqm && (
              <span className="flex items-center gap-1">
                <Maximize size={12} aria-hidden="true" /> {room.sizeSqm} m²
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={12} aria-hidden="true" /> Up to {room.maxAdults} adults
              {room.maxChildren > 0 && ` + ${room.maxChildren} children`}
            </span>
          </div>
          {room.description && (
            <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">
              {/* Vendors type one point per line; in a two-line preview those breaks
                  would collapse into an unreadable run-on, so make them separators. */}
              {room.description.trim().split(/\r?\n+/).map((line) => line.trim()).filter(Boolean).join(" · ")}
            </p>
          )}
          {room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {room.amenities.slice(0, 4).map((a) => (
                <span key={a} className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {!offer ? (
        <p className="px-4 py-3 text-sm text-slate-500 border-t border-slate-100 bg-slate-50/50">
          No live rate for these dates.
        </p>
      ) : (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4 space-y-4">
          {/* What the base price already includes. */}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span
              className={`flex items-center gap-1 text-[11px] font-medium ${
                breakfast ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              <Coffee size={11} aria-hidden="true" />
              {breakfast ? "Breakfast included" : "Room only"}
            </span>
            <span
              className={`flex items-center gap-1 text-[11px] font-medium ${
                refundable ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              {refundable ? (
                <>
                  <ShieldCheck size={11} aria-hidden="true" />
                  Free cancellation up to {cancellationHours}h before
                </>
              ) : (
                <>
                  <XCircle size={11} aria-hidden="true" />
                  Non-refundable
                </>
              )}
            </span>
            {offer.pricingMode === "per_person" && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <Users size={11} aria-hidden="true" />
                Priced per guest
              </span>
            )}
            {offer.available && offer.unitsLeft <= 3 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                <AlertCircle size={11} aria-hidden="true" />
                Only {offer.unitsLeft} left
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pt-1">
            <div>
              <p className="text-lg font-bold text-slate-900 tabular-nums">
                {formatCurrency(offer.nightlyAverage)}
                <span className="text-xs font-normal text-slate-400"> / night</span>
              </p>
              <p className="text-[11px] text-slate-500">
                {formatCurrency(offer.nightlyAverage)} × {nights} night{nights === 1 ? "" : "s"}
                {unitCount > 1 ? ` × ${unitCount} rooms` : ""}
              </p>
              <p className="text-sm font-semibold text-slate-900 mt-1 tabular-nums">
                {formatCurrency(offer.total)} total
              </p>
            </div>

            <div className="shrink-0">
              {room.slug ? (
                <Link
                  href={{
                    pathname: `/hotels/${slugify(hotelCity)}/${hotelSlug}/${room.slug}`,
                    query: { checkIn, checkOut, rooms, adults: guests },
                  }}
                  className="block text-center bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                >
                  View details
                </Link>
              ) : null}
              {!offer.available && (
                <p
                  title={offer.reason}
                  className={`mt-2 text-center text-xs font-semibold ${
                    offer.heldOnly ? "text-amber-700" : "text-slate-500"
                  }`}
                >
                  {offer.heldOnly ? "Held — try again shortly" : "Unavailable for these dates"}
                </p>
              )}
            </div>
          </div>

          {!offer.available && offer.reason && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {offer.reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
