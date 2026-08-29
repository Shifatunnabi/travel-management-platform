import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble, CalendarRange } from "lucide-react";
import { PageHeader, StatusPill } from "@/components/admin/Shell";
import { requireVendor } from "@/lib/auth/guards";
import { getVendorHotel } from "@/lib/services/vendor-data";
import HotelForm, { type HotelFormValues } from "@/components/vendor/HotelForm";

export default function EditHotelPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
      <EditHotelBody params={params} />
    </Suspense>
  );
}

async function EditHotelBody({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireVendor(["owner", "manager"]);
  const hotel = await getVendorHotel(id, user.vendorId);
  if (!hotel) notFound();

  const values: HotelFormValues = {
    _id: String(hotel._id),
    name: hotel.name,
    description: hotel.description,
    propertyType: hotel.propertyType,
    starCategory: hotel.starCategory,
    address: hotel.address,
    city: hotel.city,
    country: hotel.country,
    location: hotel.location,
    latitude: hotel.geo?.coordinates?.[1],
    longitude: hotel.geo?.coordinates?.[0],
    distanceFromCenter: hotel.distanceFromCenter,
    amenities: hotel.amenities,
    tags: hotel.tags,
    images: hotel.images.map((i) => ({
      publicId: i.publicId, url: i.url, width: i.width, height: i.height, alt: i.alt,
    })),
    policies: hotel.policies,
  };

  return (
    <>
      <PageHeader
        title={hotel.name}
        subtitle={`${hotel.location} · ${hotel.city}`}
        breadcrumb={[{ label: "Properties", href: "/vendor/hotels" }, { label: "Edit" }]}
        action={
          <div className="flex items-center gap-2">
            <StatusPill status={hotel.status} />
            <Link
              href={`/vendor/hotels/${hotel._id}/rooms`}
              className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-brand-300 text-slate-700 text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              <BedDouble size={15} /> Rooms
            </Link>
            <Link
              href={`/vendor/hotels/${hotel._id}/calendar`}
              className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-brand-300 text-slate-700 text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              <CalendarRange size={15} /> Rates
            </Link>
          </div>
        }
      />
      <HotelForm
        initial={values}
        vendorId={user.vendorId}
        isPublished={hotel.status === "published"}
      />
    </>
  );
}
