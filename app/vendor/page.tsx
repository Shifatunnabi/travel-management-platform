import { Suspense } from "react";
import Link from "next/link";
import {
  Building2, BedDouble, TrendingUp, Wallet, Star, LogIn, LogOut,
  Plus, AlertCircle, ArrowRight,
} from "lucide-react";
import { PageHeader, StatCard, Card, EmptyState, StatusPill } from "@/components/admin/Shell";
import { requireVendor } from "@/lib/auth/guards";
import { getVendor, getVendorSummary, listVendorHotels } from "@/lib/services/vendor-data";
import { formatCurrency } from "@/lib/utils/formatters";

export default function VendorDashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Today at a glance, and anything waiting on you."
        action={
          <Link
            href="/vendor/hotels/new"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} /> Add property
          </Link>
        }
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardBody />
      </Suspense>
    </>
  );
}

async function DashboardBody() {
  const user = await requireVendor();
  const [vendor, s, hotels] = await Promise.all([
    getVendor(user.vendorId),
    getVendorSummary(user.vendorId),
    listVendorHotels(user.vendorId),
  ]);

  const delta =
    s.revenuePrev30d > 0
      ? Math.round(((s.revenue30d - s.revenuePrev30d) / s.revenuePrev30d) * 100)
      : null;

  const todo = [
    s.hotelsDraft > 0 && {
      label: `${s.hotelsDraft} propert${s.hotelsDraft === 1 ? "y" : "ies"} still in draft`,
      href: "/vendor/hotels",
      cta: "Finish and submit",
    },
    s.hotelsPending > 0 && {
      label: `${s.hotelsPending} awaiting platform review`,
      href: "/vendor/hotels",
      cta: "View status",
    },
    s.unansweredReviews > 0 && {
      label: `${s.unansweredReviews} review${s.unansweredReviews === 1 ? "" : "s"} without a reply`,
      href: "/vendor/reviews",
      cta: "Reply",
    },
    !vendor?.bank.verified && {
      label: "Bank details are not verified yet",
      href: "/vendor/settings",
      cta: "Add details",
    },
  ].filter(Boolean) as { label: string; href: string; cta: string }[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Arrivals today" value={String(s.arrivalsToday)} icon={LogIn} tone="brand" hint={`${s.staying} currently staying`} />
        <StatCard label="Departures today" value={String(s.departuresToday)} icon={LogOut} tone="slate" />
        <StatCard label="Occupancy · next 7 days" value={`${s.occupancy7d}%`} icon={BedDouble} tone="emerald" />
        <StatCard
          label="Earnings · 30 days"
          value={formatCurrency(s.revenue30d)}
          icon={TrendingUp}
          tone="emerald"
          hint={delta === null ? `${s.bookings30d} bookings` : `${delta >= 0 ? "+" : ""}${delta}% vs previous 30 days`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Your properties"
            action={
              <Link href="/vendor/hotels" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                Manage all
              </Link>
            }
          >
            {hotels.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No properties yet"
                description="Add your first property, set up its rooms, and submit it for review to start taking bookings."
                action={
                  <Link
                    href="/vendor/hotels/new"
                    className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <Plus size={16} /> Add property
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-slate-100 -my-2">
                {hotels.slice(0, 5).map((h) => (
                  <li key={String(h._id)} className="py-3 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/vendor/hotels/${h._id}/edit`}
                          className="font-semibold text-slate-900 text-sm truncate hover:text-brand-600"
                        >
                          {h.name}
                        </Link>
                        <StatusPill status={h.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {h.city} · {h.roomCount} room type{h.roomCount === 1 ? "" : "s"}
                        {h.priceFrom > 0 && ` · from ${formatCurrency(h.priceFrom)}`}
                      </p>
                    </div>
                    <Link
                      href={`/vendor/hotels/${h._id}/calendar`}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 shrink-0"
                    >
                      Rates
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Balance">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500">Available to withdraw</p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {formatCurrency(s.availableBalance)}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">Pending settlement</p>
                <p className="text-lg font-semibold text-slate-600 tabular-nums">
                  {formatCurrency(s.pendingBalance)}
                </p>
              </div>
              <Link
                href="/vendor/finance"
                className="flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Wallet size={15} /> Finance
              </Link>
              {s.pendingPayouts > 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {s.pendingPayouts} disbursement request in progress
                </p>
              )}
            </div>
          </Card>

          <Card title="Guest rating">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Star size={22} className="text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {s.reviewCount ? s.rating.toFixed(1) : "—"}
                </p>
                <p className="text-xs text-slate-500">
                  {s.reviewCount} published review{s.reviewCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </Card>

          {todo.length > 0 && (
            <Card title="Needs your attention">
              <ul className="space-y-2.5">
                {todo.map((t) => (
                  <li key={t.label}>
                    <Link
                      href={t.href}
                      className="flex items-start gap-2.5 group"
                    >
                      <AlertCircle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-slate-700">{t.label}</span>
                        <span className="text-xs font-semibold text-brand-600 group-hover:text-brand-700 inline-flex items-center gap-1">
                          {t.cta} <ArrowRight size={11} />
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="h-72 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    </div>
  );
}
