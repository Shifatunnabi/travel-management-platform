import { Suspense } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { getLivePricing, type HotelCardData } from "@/lib/services/public-hotels";
import { defaultStay, type Stay } from "@/lib/utils/stay";
import HotelFilters from "./HotelFilters";
import HotelCard from "./HotelCard";
import SortControl from "./SortControl";
import type { HotelSearchParams } from "@/app/(site)/hotels/search/page";

export default function HotelResults({
  hotels,
  params,
}: {
  hotels: HotelCardData[];
  params: HotelSearchParams;
}) {
  const stay = defaultStay(params.checkIn, params.checkOut);
  const units = Number(params.rooms ?? "1") || 1;

  return (
    <div className="flex gap-6">
      <HotelFilters params={params} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5 gap-3">
          <div>
            <h1 className="font-bold text-slate-900 text-lg">
              {hotels.length} {hotels.length === 1 ? "property" : "properties"}
              {params.destination ? ` in ${params.destination}` : ""}
            </h1>
            <p className="text-slate-500 text-sm">
              {stay.checkInLabel} to {stay.checkOutLabel} · {stay.nights} night
              {stay.nights === 1 ? "" : "s"}
            </p>
          </div>
          <SortControl params={params} />
        </div>

        {hotels.length === 0 ? (
          <EmptyResults />
        ) : (
          /*
           * One boundary for the whole list, not one per card. Cards paint
           * immediately from cached content with a price placeholder, then the
           * same list swaps in with live rates from a single batched query.
           *
           * A Suspense per card would mean an availability query per hotel, and
           * nesting a boundary inside streamed PPR content breaks hydration.
           */
          <Suspense fallback={<CardList hotels={hotels} stay={stay} params={params} />}>
            <PricedCardList hotels={hotels} stay={stay} params={params} units={units} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

interface ListProps {
  hotels: HotelCardData[];
  stay: Stay;
  params: HotelSearchParams;
}

function CardList({
  hotels,
  stay,
  params,
  pricing,
}: ListProps & { pricing?: Record<string, { from: number; soldOut: boolean }> }) {
  return (
    <div className="space-y-4">
      {hotels.map((hotel) => (
        <HotelCard
          key={hotel.id}
          hotel={hotel}
          stay={stay}
          guests={params.guests ?? "2"}
          rooms={params.rooms ?? "1"}
          price={<Price live={pricing?.[hotel.id]} fallback={hotel.priceFrom} />}
        />
      ))}
    </div>
  );
}

/** Live availability for every hotel on the page, in one query. */
async function PricedCardList({
  hotels,
  stay,
  params,
  units,
}: ListProps & { units: number }) {
  const pricing = await getLivePricing(
    hotels.map((h) => h.id),
    stay.checkIn,
    stay.checkOut,
    units,
  );
  return <CardList hotels={hotels} stay={stay} params={params} pricing={pricing} />;
}

function Price({
  live,
  fallback,
}: {
  live?: { from: number; soldOut: boolean };
  fallback: number;
}) {
  if (!live) {
    return (
      <div className="text-right" aria-hidden="true">
        <div className="h-3 w-16 bg-slate-100 rounded ml-auto mb-1.5 animate-pulse" />
        <div className="h-6 w-24 bg-slate-200 rounded ml-auto animate-pulse" />
      </div>
    );
  }

  if (live.soldOut) {
    return (
      <div className="text-right">
        <p className="text-sm font-semibold text-rose-600">No rooms left</p>
        <p className="text-[11px] text-slate-400">for these dates</p>
      </div>
    );
  }

  return (
    <div className="text-right">
      <p className="text-[11px] text-slate-400">per night from</p>
      <p className="text-xl font-bold text-slate-900 tabular-nums">
        ৳{(live.from || fallback).toLocaleString("en-BD")}
      </p>
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <Building2 size={24} className="text-slate-400" />
      </div>
      <p className="font-bold text-slate-900">Nothing matches that search</p>
      <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
        Try widening the price range or removing a filter.
      </p>
      <Link
        href="/hotels/search"
        className="inline-block mt-5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        Clear all filters
      </Link>
    </div>
  );
}
