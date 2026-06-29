import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FlightSearchResults from "@/components/flights/FlightSearchResults";
import { FlightCardSkeleton } from "@/components/ui/Skeleton";

export default function FlightSearchPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-16">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <FlightCardSkeleton key={i} />
                ))}
              </div>
            </div>
          }
        >
          <FlightSearchResults />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
