import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, MapPin, Calendar, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { listCustomerBookings } from "@/lib/services/customer-data";
import { cdn } from "@/lib/services/cloudinary";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { StatusPill, EmptyState } from "@/components/admin/Shell";
import FilterTabs from "@/components/admin/FilterTabs";
import CancelBooking from "@/components/booking/CancelBooking";
import ReviewForm from "@/components/booking/ReviewForm";

const TABS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past stays" },
  { value: "cancelled", label: "Cancelled" },
  { value: "all", label: "All" },
];

export default function AccountBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; review?: string }>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My bookings</h1>
        <p className="text-slate-500 text-sm mt-1">Vouchers, changes, and reviews.</p>
      </div>
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Body({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; review?: string }>;
}) {
  const user = await requireUser();
  const { filter = "upcoming", review } = await searchParams;
  const bookings = await listCustomerBookings(
    user.id,
    filter as "upcoming" | "past" | "cancelled" | "all",
  );

  return (
    <>
      <FilterTabs basePath="/account/bookings" param="filter" current={filter} tabs={TABS} />

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <EmptyState
            icon={Bookmark}
            title={filter === "upcoming" ? "No upcoming trips" : "Nothing here"}
            description={
              filter === "upcoming"
                ? "When you book a stay it will appear here with your voucher."
                : "No bookings match this filter."
            }
            action={
              <Link
                href="/hotels/search"
                className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Find a hotel
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => (
            <li key={b.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <Link
                  href={`/hotels/${citySlug(b.hotelCity)}/${b.hotelSlug}`}
                  className="sm:w-44 shrink-0 relative aspect-[4/3] sm:aspect-auto bg-slate-100"
                >
                  {b.hotelImage && (
                    <Image
                      src={cdn(b.hotelImage, 360, 270)}
                      alt={b.hotelName}
                      fill
                      sizes="176px"
                      className="object-cover"
                    />
                  )}
                </Link>

                <div className="flex-1 p-5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <StatusPill status={b.status} />
                    <span className="text-xs text-slate-400 font-mono">{b.ref}</span>
                  </div>
                  <h2 className="font-bold text-slate-900">{b.hotelName}</h2>
                  <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <MapPin size={11} aria-hidden="true" /> {b.hotelCity}
                  </p>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" aria-hidden="true" />
                      {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.nights} night
                      {b.nights === 1 ? "" : "s"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={12} className="text-slate-400" aria-hidden="true" />
                      {b.units} × {b.roomName}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2">
                    {b.ratePlanName} ·{" "}
                    {b.refundable
                      ? `free cancellation up to ${b.cancellationHours}h before check-in`
                      : "non-refundable"}
                  </p>

                  {b.canReview && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <ReviewForm bookingRef={b.ref} hotelName={b.hotelName} open={review === b.ref} />
                    </div>
                  )}
                  {b.hasReview && (
                    <p className="mt-3 text-xs text-emerald-600 font-medium">
                      Thanks — your review has been submitted.
                    </p>
                  )}
                </div>

                <div className="sm:w-44 shrink-0 p-5 sm:border-l border-slate-100 flex sm:flex-col items-end justify-between gap-3">
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400">Total</p>
                    <p className="text-lg font-bold text-slate-900 tabular-nums">
                      {formatCurrency(b.total, b.currency)}
                    </p>
                  </div>
                  {b.canCancel && (
                    <CancelBooking
                      bookingRef={b.ref}
                      refundAmount={b.refundIfCancelledNow}
                      free={b.freeCancellation}
                    />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function citySlug(city: string): string {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
