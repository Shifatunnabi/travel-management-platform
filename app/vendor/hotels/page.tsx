import { Suspense } from "react";
import Link from "next/link";
import { Building2, Plus, CalendarRange, BedDouble, Pencil } from "lucide-react";
import { PageHeader, Card, EmptyState, StatusPill, TableWrap, Th, Td, Thumb } from "@/components/admin/Shell";
import { requireVendor } from "@/lib/auth/guards";
import { listVendorHotels } from "@/lib/services/vendor-data";
import { formatCurrency } from "@/lib/utils/formatters";
import { cdn } from "@/lib/services/cloudinary";
import HotelRowActions from "@/components/vendor/HotelRowActions";

export default function VendorHotelsPage() {
  return (
    <>
      <PageHeader
        title="Properties"
        subtitle="Everything you list on Tofiza."
        action={
          <Link
            href="/vendor/hotels/new"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} /> Add property
          </Link>
        }
      />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <HotelList />
      </Suspense>
    </>
  );
}

async function HotelList() {
  const user = await requireVendor();
  const hotels = await listVendorHotels(user.vendorId);

  if (hotels.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Building2}
          title="No properties yet"
          description="Create a property, add its room types, then submit it for review. Approval usually takes under a working day."
          action={
            <Link
              href="/vendor/hotels/new"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus size={16} /> Add your first property
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <TableWrap>
        <thead>
          <tr className="border-b border-slate-100">
            <Th>Property</Th>
            <Th>Status</Th>
            <Th>Rooms</Th>
            <Th align="right">From</Th>
            <Th align="right">Rating</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {hotels.map((h) => (
            <tr key={String(h._id)} className="hover:bg-slate-50/60">
              <Td>
                <div className="flex items-center gap-3">
                  <Thumb src={h.images[0] ? cdn(h.images[0].url, 88, 88) : undefined} alt="" />
                  <div className="min-w-0">
                    <Link
                      href={`/vendor/hotels/${h._id}/edit`}
                      className="font-semibold text-slate-900 hover:text-brand-600 block truncate"
                    >
                      {h.name}
                    </Link>
                    <p className="text-xs text-slate-500 truncate">
                      {h.city} · {h.starCategory}-star
                    </p>
                  </div>
                </div>
              </Td>
              <Td>
                <div className="space-y-1">
                  <StatusPill status={h.status} />
                  {h.pendingRevision && (
                    <p className="text-[11px] text-amber-600 font-medium">Edit awaiting review</p>
                  )}
                  {h.status === "rejected" && h.moderation?.note && (
                    <p className="text-[11px] text-rose-600 max-w-48">{h.moderation.note}</p>
                  )}
                </div>
              </Td>
              <Td>
                <Link
                  href={`/vendor/hotels/${h._id}/rooms`}
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-brand-600 font-medium"
                >
                  <BedDouble size={14} className="text-slate-400" />
                  {h.roomCount}
                </Link>
              </Td>
              <Td align="right" className="tabular-nums font-medium text-slate-700">
                {h.priceFrom > 0 ? formatCurrency(h.priceFrom) : "—"}
              </Td>
              <Td align="right" className="tabular-nums">
                {h.displayReviewCount > 0 ? (
                  <span className="font-semibold text-slate-900">
                    {h.displayRating.toFixed(1)}
                    <span className="text-xs text-slate-400 font-normal ml-1">
                      ({h.displayReviewCount})
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-400">No reviews</span>
                )}
              </Td>
              <Td align="right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/vendor/hotels/${h._id}/calendar`}
                    title="Rates and availability"
                    className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <CalendarRange size={15} />
                  </Link>
                  <Link
                    href={`/vendor/hotels/${h._id}/edit`}
                    title="Edit property"
                    className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <Pencil size={15} />
                  </Link>
                  <HotelRowActions
                    hotelId={String(h._id)}
                    status={h.status}
                    roomCount={h.roomCount}
                    imageCount={h.images.length}
                  />
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </Card>
  );
}
