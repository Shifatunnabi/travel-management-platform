import { Suspense } from "react";
import Link from "next/link";
import { BookMarked, Search } from "lucide-react";
import { PageHeader, Card, EmptyState, StatusPill, TableWrap, Th, Td } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/connect";
import { Booking } from "@/lib/models/Booking";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { BookingStatus } from "@/lib/models/types";
import FilterTabs from "@/components/admin/FilterTabs";

const TABS = [
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "In house" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "pending_payment", label: "Unpaid holds" },
  { value: "all", label: "All" },
];

export default function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  return (
    <>
      <PageHeader title="Bookings" subtitle="Every booking across every partner." />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Body({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requirePlatform();
  const { status = "confirmed", q } = await searchParams;

  await connectDB();
  const query: Record<string, unknown> = {};
  if (status === "cancelled") {
    query.status = { $in: ["cancelled", "refunded", "no_show", "expired"] as BookingStatus[] };
  } else if (status !== "all") {
    query.status = status as BookingStatus;
  }
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [
      { ref: rx },
      { "guestDetails.fullName": rx },
      { "guestDetails.email": rx },
      { "guestDetails.phone": rx },
      { "snapshot.hotelName": rx },
    ];
  }

  const bookings = await Booking.find(query).sort({ createdAt: -1 }).limit(200).lean();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <FilterTabs basePath="/admin/bookings" param="status" current={status} tabs={TABS} />
        <form action="/admin/bookings" className="sm:ml-auto flex gap-2">
          <input type="hidden" name="status" value={status} />
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Reference, guest, email"
              aria-label="Search bookings"
              className="border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm outline-none focus:border-brand-500 min-w-56"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 rounded-xl transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <Card>
        {bookings.length === 0 ? (
          <EmptyState icon={BookMarked} title="No bookings found" description="Try a different filter or search term." />
        ) : (
          <TableWrap>
            <thead>
              <tr className="border-b border-slate-100">
                <Th>Reference</Th>
                <Th>Guest</Th>
                <Th>Property</Th>
                <Th>Stay</Th>
                <Th>Status</Th>
                <Th align="right">Value</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.map((b) => (
                <tr key={String(b._id)} className="hover:bg-slate-50/60">
                  <Td>
                    <span className="font-mono text-xs font-semibold text-slate-900">{b.ref}</span>
                    <span className="block text-[11px] text-slate-400">
                      {formatDate(b.createdAt.toISOString())}
                    </span>
                  </Td>
                  <Td>
                    <p className="text-slate-800">{b.guestDetails.fullName || "—"}</p>
                    <p className="text-[11px] text-slate-500">{b.guestDetails.email}</p>
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/hotels/${b.hotelId}/rating`}
                      className="text-slate-700 hover:text-brand-600"
                    >
                      {b.snapshot.hotelName}
                    </Link>
                    <p className="text-[11px] text-slate-500">
                      {b.units} × {b.snapshot.roomName}
                    </p>
                  </Td>
                  <Td className="text-xs text-slate-600 whitespace-nowrap">
                    {formatDate(b.checkIn.toISOString())} → {formatDate(b.checkOut.toISOString())}
                  </Td>
                  <Td>
                    <StatusPill status={b.status} />
                    {b.cancellation?.reason && (
                      <p className="text-[11px] text-slate-400 mt-1 max-w-40">{b.cancellation.reason}</p>
                    )}
                  </Td>
                  <Td align="right" className="tabular-nums">
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(b.pricing.grandTotal, b.pricing.currency)}
                    </span>
                    <span className="block text-[11px] text-emerald-600">
                      +{formatCurrency(b.pricing.commissionAmount)} commission
                    </span>
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
