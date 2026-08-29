import { Suspense } from "react";
import { BookMarked, Calendar, Users, Mail, Phone } from "lucide-react";
import { PageHeader, Card, EmptyState, StatusPill, TableWrap, Th, Td } from "@/components/admin/Shell";
import { requireVendor } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/connect";
import { Booking } from "@/lib/models/Booking";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { BookingStatus } from "@/lib/models/types";
import FilterTabs from "@/components/admin/FilterTabs";
import BookingActions from "@/components/vendor/BookingActions";

const TABS = [
  { value: "arrivals", label: "Arriving" },
  { value: "staying", label: "In house" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "all", label: "All" },
];

export default function VendorBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  return (
    <>
      <PageHeader title="Bookings" subtitle="Arrivals, in-house guests, and everything already stayed." />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Body({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const user = await requireVendor();
  const { filter = "arrivals" } = await searchParams;

  await connectDB();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const queries: Record<string, Record<string, unknown>> = {
    arrivals: { status: "confirmed", checkIn: { $gte: today, $lt: tomorrow } },
    staying: { status: "checked_in" },
    upcoming: { status: "confirmed", checkIn: { $gte: tomorrow } },
    completed: { status: "completed" },
    cancelled: { status: { $in: ["cancelled", "refunded", "no_show", "expired"] as BookingStatus[] } },
    all: { status: { $ne: "pending_payment" as BookingStatus } },
  };

  const bookings = await Booking.find({ vendorId: user.vendorId, ...(queries[filter] ?? queries.arrivals) })
    .sort({ checkIn: 1 })
    .limit(200)
    .lean();

  return (
    <div className="space-y-4">
      <FilterTabs basePath="/vendor/bookings" param="filter" current={filter} tabs={TABS} />
      <Card>
        {bookings.length === 0 ? (
          <EmptyState
            icon={BookMarked}
            title={filter === "arrivals" ? "No arrivals today" : "Nothing here"}
            description={
              filter === "arrivals"
                ? "Guests due to check in today will appear here."
                : "No bookings match this filter."
            }
          />
        ) : (
          <TableWrap>
            <thead>
              <tr className="border-b border-slate-100">
                <Th>Guest</Th>
                <Th>Stay</Th>
                <Th>Room</Th>
                <Th>Status</Th>
                <Th align="right">You earn</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.map((b) => (
                <tr key={String(b._id)} className="hover:bg-slate-50/60">
                  <Td>
                    <p className="font-semibold text-slate-900">{b.guestDetails.fullName || "—"}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{b.ref}</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      {b.guestDetails.email && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Mail size={10} aria-hidden="true" /> {b.guestDetails.email}
                        </span>
                      )}
                      {b.guestDetails.phone && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Phone size={10} aria-hidden="true" /> {b.guestDetails.phone}
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Calendar size={12} className="text-slate-400" aria-hidden="true" />
                      {formatDate(b.checkIn.toISOString())} → {formatDate(b.checkOut.toISOString())}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <Users size={10} aria-hidden="true" />
                      {b.guests.adults} adults
                      {b.guests.children > 0 && `, ${b.guests.children} children`} · {b.nights}n
                    </span>
                  </Td>
                  <Td>
                    <p className="text-slate-700">{b.units} × {b.snapshot.roomName}</p>
                    <p className="text-[11px] text-slate-500">{b.snapshot.ratePlanName}</p>
                    {b.guestDetails.specialRequests && (
                      <p className="text-[11px] text-amber-600 mt-1 max-w-48">
                        “{b.guestDetails.specialRequests}”
                      </p>
                    )}
                  </Td>
                  <Td><StatusPill status={b.status} /></Td>
                  <Td align="right" className="tabular-nums">
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(b.pricing.vendorEarning, b.pricing.currency)}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      of {formatCurrency(b.pricing.grandTotal, b.pricing.currency)}
                    </span>
                  </Td>
                  <Td align="right">
                    <BookingActions bookingRef={b.ref} status={b.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  );
}
