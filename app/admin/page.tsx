import { Suspense } from "react";
import Link from "next/link";
import {
  TrendingUp, Wallet, BookMarked, XCircle, Store, Building2,
  MessageSquareWarning, Banknote, CreditCard, ArrowRight, Users,
} from "lucide-react";
import { PageHeader, StatCard, Card } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { getAdminSummary } from "@/lib/services/admin-data";
import { formatCurrency } from "@/lib/utils/formatters";

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader title="Platform dashboard" subtitle="Trade over the last 30 days, and the queues waiting on you." />
      <Suspense fallback={<Skeleton />}>
        <Body />
      </Suspense>
    </>
  );
}

async function Body() {
  // Reading the session first marks this render request-time, which is what
  // lets the summary below read the clock for its rolling windows.
  await requirePlatform();
  const s = await getAdminSummary();
  const delta =
    s.gmvPrev30d > 0 ? Math.round(((s.gmv30d - s.gmvPrev30d) / s.gmvPrev30d) * 100) : null;

  const queues = [
    { label: "Vendor applications", count: s.vendorsPending, href: "/admin/vendors?status=pending", icon: Store },
    { label: "Properties awaiting review", count: s.hotelsPending, href: "/admin/hotels?status=pending_review", icon: Building2 },
    { label: "Reviews to moderate", count: s.reviewsPending, href: "/admin/reviews", icon: MessageSquareWarning },
    { label: "Disbursement requests", count: s.payoutsPending, href: "/admin/payouts", icon: Banknote },
    { label: "Failed payments (7 days)", count: s.paymentsFailed7d, href: "/admin/payments?status=failed", icon: CreditCard },
  ];
  const active = queues.filter((q) => q.count > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="GMV · 30 days"
          value={formatCurrency(s.gmv30d)}
          icon={TrendingUp}
          tone="brand"
          hint={delta === null ? `${s.bookings30d} bookings` : `${delta >= 0 ? "+" : ""}${delta}% vs previous 30 days`}
        />
        <StatCard label="Commission earned" value={formatCurrency(s.commission30d)} icon={Wallet} tone="emerald" hint="Net to Tofiza" />
        <StatCard label="Bookings" value={String(s.bookings30d)} icon={BookMarked} tone="slate" />
        <StatCard
          label="Cancellation rate"
          value={`${s.cancellationRate}%`}
          icon={XCircle}
          tone={s.cancellationRate > 20 ? "rose" : "slate"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Needs action" className="lg:col-span-2">
          {active.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              Every queue is clear. Nothing is waiting on the platform team.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 -my-2">
              {active.map(({ label, count, href, icon: Icon }) => (
                <li key={label}>
                  <Link href={href} className="flex items-center gap-3 py-3 group">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-amber-600" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-slate-700">{label}</span>
                    <span className="text-lg font-bold text-slate-900 tabular-nums">{count}</span>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-600 transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Marketplace">
          <dl className="space-y-3 text-sm">
            {[
              ["Active vendors", String(s.vendorsActive), Store],
              ["Live properties", String(s.hotelsLive), Building2],
              ["Registered customers", s.customers.toLocaleString("en-BD"), Users],
              ["Pending disbursements", formatCurrency(s.payoutsPendingAmount), Banknote],
            ].map(([label, value, Icon]) => {
              const I = Icon as typeof Store;
              return (
                <div key={label as string} className="flex items-center gap-3">
                  <I size={15} className="text-slate-400 shrink-0" />
                  <dt className="flex-1 text-slate-600">{label as string}</dt>
                  <dd className="font-bold text-slate-900 tabular-nums">{value as string}</dd>
                </div>
              );
            })}
          </dl>
        </Card>
      </div>
    </div>
  );
}

function Skeleton() {
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
