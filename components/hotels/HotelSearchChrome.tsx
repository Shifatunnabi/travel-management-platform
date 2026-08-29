import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Users } from "lucide-react";
import { defaultStay } from "@/lib/utils/stay";
import type { HotelSearchParams } from "@/app/(site)/hotels/search/page";

export default async function HotelSearchChrome({
  searchParams,
}: {
  searchParams: Promise<HotelSearchParams>;
}) {
  const params = await searchParams;
  const stay = defaultStay(params.checkIn, params.checkOut);
  const destination = params.destination?.trim() || "All destinations";
  const guests = params.guests ?? "2";
  const rooms = params.rooms ?? "1";

  return (
    <div className="bg-brand-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-brand-200 hover:text-white text-sm transition-colors">
            <ArrowLeft size={15} />
            Back
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
            <div className="flex items-center gap-2 bg-brand-800 rounded-xl px-4 py-2">
              <MapPin size={14} />
              <span className="font-bold">{destination}</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-200">
              <Calendar size={14} />
              <span>
                {stay.checkInLabel} → {stay.checkOutLabel} · {stay.nights} night
                {stay.nights === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-200">
              <Users size={14} />
              <span>
                {guests} guest{guests === "1" ? "" : "s"} · {rooms} room{rooms === "1" ? "" : "s"}
              </span>
            </div>
            <Link href="/" className="ml-auto text-xs text-brand-300 hover:text-white underline">
              Modify search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
