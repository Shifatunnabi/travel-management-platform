import { Suspense } from "react";
import Link from "next/link";
import { Banknote, ShieldAlert, ShieldCheck } from "lucide-react";
import { PageHeader, Card, EmptyState, StatusPill } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { listAllPayouts, getVendorBalance } from "@/lib/services/ledger";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import FilterTabs from "@/components/admin/FilterTabs";
import PayoutDecision from "@/components/admin/PayoutDecision";

const TABS = [
  { value: "requested", label: "Requested" },
  { value: "approved", label: "Approved · to pay" },
  { value: "paid", label: "Paid" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export default function AdminPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <>
      <PageHeader
        title="Disbursements"
        subtitle="Partner requests, checked against the ledger before approval."
      />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Body({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requirePlatform(["super_admin", "finance"]);
  const { status = "requested" } = await searchParams;
  const payouts = await listAllPayouts(status);

  // The ledger is the authority — show what each vendor can actually support.
  const balances = new Map(
    await Promise.all(
      [...new Set(payouts.map((p) => String(p.vendorId)))].map(
        async (id) => [id, await getVendorBalance(id)] as const,
      ),
    ),
  );

  return (
    <div className="space-y-4">
      <FilterTabs basePath="/admin/payouts" param="status" current={status} tabs={TABS} />

      {payouts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Banknote}
            title={status === "requested" ? "No requests waiting" : "Nothing here"}
            description={
              status === "requested"
                ? "Partner disbursement requests appear here for review."
                : "No disbursements match this filter."
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {payouts.map((p) => {
            const balance = balances.get(String(p.vendorId));
            const amount = p.approvedAmount ?? p.requestedAmount;
            const covered = balance ? balance.available >= amount : false;

            return (
              <Card key={String(p._id)}>
                <div className="flex flex-col lg:flex-row gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Link
                        href={`/admin/vendors/${p.vendorId}`}
                        className="font-bold text-slate-900 hover:text-brand-600"
                      >
                        {p.vendorName}
                      </Link>
                      <StatusPill status={p.status} />
                      {p.bankVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <ShieldCheck size={11} /> Bank verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                          <ShieldAlert size={11} /> Bank unverified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Requested {formatDate(p.createdAt.toISOString())} · {p.vendorEmail}
                    </p>

                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <Figure label="Requested" value={formatCurrency(p.requestedAmount)} />
                      <Figure
                        label="Ledger available"
                        value={balance ? formatCurrency(balance.available) : "—"}
                        tone={covered ? "ok" : "warn"}
                      />
                      <Figure label="Still settling" value={balance ? formatCurrency(balance.pending) : "—"} />
                      <Figure label="Paid to date" value={balance ? formatCurrency(balance.lifetimePaidOut) : "—"} />
                    </div>

                    <dl className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        ["Account", p.bankSnapshot.accountName],
                        ["Number", p.bankSnapshot.accountNumber],
                        ["Bank", p.bankSnapshot.bankName],
                        ["Branch", p.bankSnapshot.branch],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-slate-400">{label}</dt>
                          <dd className="font-medium text-slate-700">{value ?? "—"}</dd>
                        </div>
                      ))}
                    </dl>

                    {p.paymentReference && (
                      <p className="mt-2 text-xs text-emerald-700">
                        Paid {p.paidAt && formatDate(p.paidAt.toISOString())} · ref {p.paymentReference}
                      </p>
                    )}
                    {p.rejectionReason && (
                      <p className="mt-2 text-xs text-rose-600">{p.rejectionReason}</p>
                    )}
                  </div>

                  <div className="lg:w-72 shrink-0">
                    <PayoutDecision
                      payoutId={String(p._id)}
                      status={p.status}
                      requestedAmount={p.requestedAmount}
                      available={balance?.available ?? 0}
                      bankVerified={p.bankVerified}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400">{label}</p>
      <p
        className={`font-bold tabular-nums ${
          tone === "ok" ? "text-emerald-600" : tone === "warn" ? "text-rose-600" : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
