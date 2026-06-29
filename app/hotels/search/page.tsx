import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HotelSearchResults from "@/components/hotels/HotelSearchResults";
import { HotelCardSkeleton } from "@/components/ui/Skeleton";

export default function HotelSearchPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-16">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <HotelCardSkeleton key={i} />
                ))}
              </div>
            </div>
          }
        >
          <HotelSearchResults />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
