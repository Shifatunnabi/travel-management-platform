import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble, Pencil } from "lucide-react";
import { PageHeader, Card, EmptyState } from "@/components/admin/Shell";
import { requireVendor } from "@/lib/auth/guards";
import { getVendorHotel, listHotelRooms, getRoomCalendar } from "@/lib/services/vendor-data";
import { toDateKey, toNight } from "@/lib/services/inventory";
import RateCalendar from "@/components/vendor/RateCalendar";

export default function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ room?: string; start?: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
      <CalendarBody params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CalendarBody({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ room?: string; start?: string }>;
}) {
  const { id } = await params;
  const { room: roomParam, start: startParam } = await searchParams;
  const user = await requireVendor(["owner", "manager"]);

  const hotel = await getVendorHotel(id, user.vendorId);
  if (!hotel) notFound();

  const rooms = await listHotelRooms(id, user.vendorId);
  const activeRooms = rooms.filter((r) => r.status === "active");

  const header = (
    <PageHeader
      title="Rates & availability"
      subtitle={`${hotel.name} · ${hotel.city}`}
      breadcrumb={[
        { label: "Properties", href: "/vendor/hotels" },
        { label: hotel.name, href: `/vendor/hotels/${id}/edit` },
        { label: "Rates" },
      ]}
      action={
        <div className="flex items-center gap-2">
          <Link
            href={`/vendor/hotels/${id}/rooms`}
            className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-brand-300 text-slate-700 text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            <BedDouble size={15} /> Rooms
          </Link>
          <Link
            href={`/vendor/hotels/${id}/edit`}
            className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-brand-300 text-slate-700 text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            <Pencil size={15} /> Property
          </Link>
        </div>
      }
    />
  );

  if (activeRooms.length === 0) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            icon={BedDouble}
            title="No active rooms"
            description="Rates are set per room type. Add a room before pricing any dates."
            action={
              <Link
                href={`/vendor/hotels/${id}/rooms`}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                Manage rooms
              </Link>
            }
          />
        </Card>
      </>
    );
  }

  const selected =
    activeRooms.find((r) => String(r._id) === roomParam) ?? activeRooms[0];
  const startKey =
    startParam && /^\d{4}-\d{2}-\d{2}$/.test(startParam)
      ? startParam
      : toDateKey(toNight(new Date()));

  const calendar = await getRoomCalendar(String(selected._id), user.vendorId, startKey, 35);
  if (!calendar) notFound();

  return (
    <>
      {header}
      <RateCalendar
        hotelId={id}
        startKey={startKey}
        rooms={activeRooms.map((r) => ({
          id: String(r._id),
          name: r.name,
          basePrice: r.basePrice,
          totalUnits: r.totalUnits,
        }))}
        selectedRoomId={String(selected._id)}
        nights={calendar.nights}
      />
    </>
  );
}
