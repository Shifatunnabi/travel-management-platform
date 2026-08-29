import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarRange, Pencil } from "lucide-react";
import { PageHeader, Card, StatusPill } from "@/components/admin/Shell";
import { requireVendor } from "@/lib/auth/guards";
import { getVendorHotel, listHotelRooms } from "@/lib/services/vendor-data";
import RoomManager from "@/components/vendor/RoomManager";

export default function HotelRoomsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
      <RoomsBody params={params} />
    </Suspense>
  );
}

async function RoomsBody({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireVendor(["owner", "manager"]);
  const hotel = await getVendorHotel(id, user.vendorId);
  if (!hotel) notFound();

  const rooms = await listHotelRooms(id, user.vendorId);

  return (
    <>
      <PageHeader
        title="Rooms"
        subtitle={`${hotel.name} · ${hotel.city}`}
        breadcrumb={[
          { label: "Properties", href: "/vendor/hotels" },
          { label: hotel.name, href: `/vendor/hotels/${id}/edit` },
          { label: "Rooms" },
        ]}
        action={
          <div className="flex items-center gap-2">
            <StatusPill status={hotel.status} />
            <Link
              href={`/vendor/hotels/${id}/edit`}
              className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-brand-300 text-slate-700 text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              <Pencil size={15} /> Property
            </Link>
            <Link
              href={`/vendor/hotels/${id}/calendar`}
              className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-brand-300 text-slate-700 text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              <CalendarRange size={15} /> Rates
            </Link>
          </div>
        }
      />

      {hotel.images.length < 3 && (
        <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          This property has {hotel.images.length} photo{hotel.images.length === 1 ? "" : "s"}. Add at
          least three on the{" "}
          <Link href={`/vendor/hotels/${id}/edit`} className="font-semibold underline">
            property page
          </Link>{" "}
          before submitting for review.
        </div>
      )}

      <RoomManager
        hotelId={id}
        rooms={rooms.map((r) => ({
          _id: String(r._id),
          name: r.name,
          description: r.description,
          bedType: r.bedType,
          sizeSqm: r.sizeSqm,
          maxAdults: r.maxAdults,
          maxChildren: r.maxChildren,
          basePrice: r.basePrice,
          totalUnits: r.totalUnits,
          amenities: r.amenities,
          status: r.status,
          images: r.images.map((i) => ({
            publicId: i.publicId, url: i.url, width: i.width, height: i.height, alt: i.alt,
          })),
          ratePlans: r.ratePlans.map((p) => ({ ...p })),
        }))}
      />
    </>
  );
}
