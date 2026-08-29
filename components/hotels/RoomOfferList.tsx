import Link from "next/link";
import Image from "next/image";
import { Bed, Maximize, Users, Coffee, ShieldCheck, XCircle, AlertCircle } from "lucide-react";
import { cdn } from "@/lib/services/cloudinary";
import { formatCurrency } from "@/lib/utils/formatters";
import type { RoomOffer } from "@/lib/services/public-hotels";

interface RoomSummary {
  id: string;
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
  items,
  nights,
  checkIn,
  checkOut,
  guests,
  rooms,
}: {
  hotelSlug: string;
  hotelCity: string;
  items: { room: RoomSummary; offers: RoomOffer[] }[];
  nights: number;
  checkIn: string;
  checkOut: string;
  guests: string;
  rooms: string;
}) {
  return (
    <div className="space-y-4">
      {items.map(({ room, offers }) => (
        <div key={room.id} className="border border-slate-200 rounded-xl overflow-hidden">
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
                    <Maximize size={12} aria-hidden="true" /> {room.sizeSqm} sqm
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users size={12} aria-hidden="true" /> Up to {room.maxAdults} adults
                  {room.maxChildren > 0 && ` + ${room.maxChildren} children`}
                </span>
              </div>
              {room.description && (
                <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">{room.description}</p>
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

          <ul className="divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/50">
            {offers.map((offer) => (
              <li
                key={offer.ratePlanCode}
                className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{offer.ratePlanName}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    <span
                      className={`flex items-center gap-1 text-[11px] font-medium ${
                        offer.breakfast ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      <Coffee size={11} aria-hidden="true" />
                      {offer.breakfast ? "Breakfast included" : "Room only"}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-[11px] font-medium ${
                        offer.refundable ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {offer.refundable ? (
                        <>
                          <ShieldCheck size={11} aria-hidden="true" />
                          Free cancellation up to {offer.cancellationHours}h before
                        </>
                      ) : (
                        <>
                          <XCircle size={11} aria-hidden="true" />
                          Non-refundable
                        </>
                      )}
                    </span>
                  </div>
                  {offer.available && offer.unitsLeft <= 3 && (
                    <p className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 mt-1">
                      <AlertCircle size={11} aria-hidden="true" />
                      Only {offer.unitsLeft} left at this price
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-slate-900 tabular-nums">
                    {formatCurrency(offer.nightlyAverage)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    per night · {formatCurrency(offer.total)} total
                  </p>
                </div>

                <div className="shrink-0">
                  {offer.available ? (
                    <Link
                      href={{
                        pathname: "/book/hotel/start",
                        query: {
                          roomId: offer.roomId,
                          plan: offer.ratePlanCode,
                          checkIn,
                          checkOut,
                          guests,
                          rooms,
                        },
                      }}
                      className="block text-center bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                    >
                      Reserve
                    </Link>
                  ) : (
                    <span
                      title={offer.reason}
                      className="block text-center bg-slate-100 text-slate-400 text-sm font-semibold px-5 py-2.5 rounded-xl cursor-not-allowed whitespace-nowrap"
                    >
                      Unavailable
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {offers.length > 0 && !offers[0].available && offers[0].reason && (
            <p className="px-4 py-2 text-xs text-amber-700 bg-amber-50 border-t border-amber-200">
              {offers[0].reason}
            </p>
          )}
          <p className="sr-only">
            Prices shown are for {nights} night{nights === 1 ? "" : "s"}.
          </p>
        </div>
      ))}
    </div>
  );
}
