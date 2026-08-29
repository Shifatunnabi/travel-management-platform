import { Suspense } from "react";
import type { Metadata } from "next";
import { searchHotels } from "@/lib/services/public-hotels";
import HotelSearchChrome from "@/components/hotels/HotelSearchChrome";
import HotelResults from "@/components/hotels/HotelResults";
import { HotelCardSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Hotel search · Tofiza",
  description: "Compare hotels across Bangladesh with live prices and instant confirmation.",
};

export interface HotelSearchParams {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  rooms?: string;
  sort?: string;
  stars?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  amenities?: string;
}

export default function HotelSearchPage({
  searchParams,
}: {
  searchParams: Promise<HotelSearchParams>;
}) {
  return (
    <main className="min-h-screen bg-slate-50 pt-16">
      {/* Search summary reads the URL, so it streams — but only this strip. */}
      <Suspense fallback={<div className="bg-brand-700 h-[68px]" />}>
        <HotelSearchChrome searchParams={searchParams} />
      </Suspense>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<ResultsSkeleton />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function Results({ searchParams }: { searchParams: Promise<HotelSearchParams> }) {
  const params = await searchParams;

  // The descriptive half is cached; live prices are fetched inside HotelResults
  // and streamed separately.
  const hotels = await searchHotels({
    destination: params.destination?.trim() || undefined,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    stars: params.stars ? params.stars.split(",").map(Number).filter(Boolean) : undefined,
    minRating: params.minRating ? Number(params.minRating) : undefined,
    amenities: params.amenities ? params.amenities.split(",").filter(Boolean) : undefined,
    sort: params.sort,
  });

  return <HotelResults hotels={hotels} params={params} />;
}

function ResultsSkeleton() {
  return (
    <div className="flex gap-6" aria-hidden="true">
      <div className="hidden lg:block w-64 shrink-0">
        <div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
      <div className="flex-1 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <HotelCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
