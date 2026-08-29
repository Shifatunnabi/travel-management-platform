import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { PageHeader, Card, EmptyState } from "@/components/admin/Shell";
import { requireVendor } from "@/lib/auth/guards";
import { listVendorHotels } from "@/lib/services/vendor-data";

/** Rates live per property; this picks one when the vendor has several. */
export default function CalendarIndexPage() {
  return (
    <>
      <PageHeader title="Rates & availability" subtitle="Choose a property to price." />
      <Suspense fallback={<div className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Picker />
      </Suspense>
    </>
  );
}

async function Picker() {
  const user = await requireVendor(["owner", "manager"]);
  const hotels = await listVendorHotels(user.vendorId);
  const withRooms = hotels.filter((h) => h.roomCount > 0);

  if (withRooms.length === 1) redirect(`/vendor/hotels/${withRooms[0]._id}/calendar`);

  if (withRooms.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Building2}
          title="Nothing to price yet"
          description="Rates are set per room type. Add a property with at least one room first."
          action={
            <Link
              href="/vendor/hotels/new"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              Add a property
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <ul className="divide-y divide-slate-100 -my-2">
        {withRooms.map((h) => (
          <li key={String(h._id)}>
            <Link
              href={`/vendor/hotels/${h._id}/calendar`}
              className="flex items-center justify-between gap-3 py-3 group"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 group-hover:text-brand-600 truncate">
                  {h.name}
                </p>
                <p className="text-xs text-slate-500">
                  {h.city} · {h.roomCount} room type{h.roomCount === 1 ? "" : "s"}
                </p>
              </div>
              <span className="text-xs font-semibold text-brand-600 shrink-0">Open calendar</span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
