import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2, CheckCircle, Wallet, CalendarClock, ArrowRight, MapPin, Plane,
} from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { listCustomerBookings, getCustomerStats } from "@/lib/services/customer-data";
import { cdn } from "@/lib/services/cloudinary";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { StatCard, StatusPill } from "@/components/admin/Shell";

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton />}>
        <Body />
      </Suspense>
    </div>
  );
}

async function Body() {
  const user = await requireUser();
  const [upcoming, stats] = await Promise.all([
    listCustomerBookings(user.id, "upcoming"),
    getCustomerStats(user.id),
  ]);

  const firstName = (user.name ?? "there").split(" ")[0];

  return (
    <>
      <div className="bg-gradient-to-r from-brand-700 to-brand-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {firstName}</h1>
        <p className="text-brand-200 text-sm">
          {upcoming.length === 0
            ? "No trips booked yet — the next one is a search away."
            : `You have ${upcoming.length} upcoming ${upcoming.length === 1 ? "stay" : "stays"}.`}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/hotels/search"
            className="flex items-center gap-2 px-4 py-2 bg-white text-brand-700 rounded-xl text-sm font-semibold hover:bg-brand-50 transition-colors"
          >
            <Building2 size={15} /> Book a hotel
          </Link>
          <Link
            href="/flights/search"
            className="flex items-center gap-2 px-4 py-2 bg-brand-800/60 text-white rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors"
          >
            <Plane size={15} /> Book a flight
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Upcoming stays" value={String(stats.upcoming)} icon={CalendarClock} tone="brand" />
        <StatCard label="Completed trips" value={String(stats.completed)} icon={CheckCircle} tone="emerald" />
        <StatCard label="Total bookings" value={String(stats.total)} icon={Building2} tone="slate" />
        <StatCard label="Spent with Tofiza" value={formatCurrency(stats.spent)} icon={Wallet} tone="amber" />
      </div>

      <section className="bg-white rounded-2xl border border-slate-200">
        <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-sm">Upcoming stays</h2>
          <Link href="/account/bookings" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </header>

        {upcoming.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-semibold text-slate-800">Nothing booked yet</p>
            <p className="text-sm text-slate-500 mt-1 mb-5">
              When you book a stay it appears here with your voucher.
            </p>
            <Link
              href="/hotels/search"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Find a hotel <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcoming.slice(0, 4).map((b) => (
              <li key={b.id} className="flex items-center gap-4 px-5 py-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  {b.hotelImage && (
                    <Image
                      src={cdn(b.hotelImage, 128, 128)}
                      alt={b.hotelName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 truncate">{b.hotelName}</p>
                    <StatusPill status={b.status} />
                  </div>
                  <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <MapPin size={11} aria-hidden="true" /> {b.hotelCity}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatDate(b.checkIn)} → {formatDate(b.checkOut)} ·{" "}
                    <span className="font-mono">{b.ref}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900 tabular-nums">
                    {formatCurrency(b.total, b.currency)}
                  </p>
                  <Link
                    href="/account/bookings"
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Manage
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="h-36 bg-slate-200 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
    </div>
  );
}
