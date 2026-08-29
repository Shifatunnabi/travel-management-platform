import { Suspense } from "react";
import { Wallet, Clock, Lock, TrendingUp, Receipt } from "lucide-react";
import { PageHeader, StatCard, Card, EmptyState, StatusPill, TableWrap, Th, Td } from "@/components/admin/Shell";
import { requireVendor } from "@/lib/auth/guards";
import { getVendorBalance, listLedger, listVendorPayouts } from "@/lib/services/ledger";
import { getVendor } from "@/lib/services/vendor-data";
import { readSettings } from "@/lib/services/settings";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import PayoutRequest from "@/components/vendor/PayoutRequest";

const TYPE_LABELS: Record<string, string> = {
  earning: "Booking earning",
  commission: "Platform commission",
  refund: "Refund",
  commission_reversal: "Commission reversed",
  adjustment: "Adjustment",
  payout: "Disbursement",
};

export default function VendorFinancePage() {
  return (
    <>
      <PageHeader title="Finance" subtitle="What you have earned, what is settled, and what you can withdraw." />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body />
      </Suspense>
    </>
  );
}

async function Body() {
  const user = await requireVendor();
  const [balance, ledger, payouts, vendor, settings] = await Promise.all([
    getVendorBalance(user.vendorId),
    listLedger(user.vendorId),
    listVendorPayouts(user.vendorId),
    getVendor(user.vendorId),
    readSettings(),
  ]);

  const isOwner = user.vendorRole === "owner";
  const commissionPct = vendor?.commissionPct ?? settings.defaultCommissionPct;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Available now" value={formatCurrency(balance.available)} icon={Wallet} tone="emerald" />
        <StatCard
          label="Pending settlement"
          value={formatCurrency(balance.pending)}
          icon={Clock}
          tone="amber"
          hint={`Released ${settings.settlementDays} days after check-out`}
        />
        <StatCard label="In a request" value={formatCurrency(balance.requested)} icon={Lock} tone="slate" />
        <StatCard
          label="Lifetime earned"
          value={formatCurrency(balance.lifetimeEarned)}
          icon={TrendingUp}
          tone="brand"
          hint={`After ${commissionPct}% commission`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Statement" description="Every movement of money on your account.">
            {ledger.length === 0 ? (
              <EmptyState icon={Receipt} title="Nothing yet" description="Earnings appear here as bookings are confirmed." />
            ) : (
              <TableWrap>
                <thead>
                  <tr className="border-b border-slate-100">
                    <Th>Date</Th>
                    <Th>Type</Th>
                    <Th>Detail</Th>
                    <Th align="right">Amount</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ledger.map((row) => (
                    <tr key={row.id}>
                      <Td className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(row.createdAt)}
                      </Td>
                      <Td className="text-slate-700">{TYPE_LABELS[row.type] ?? row.type}</Td>
                      <Td className="text-xs text-slate-500">
                        {row.note}
                        {row.availableAt && new Date(row.availableAt) > new Date() && (
                          <span className="block text-amber-600">
                            available {formatDate(row.availableAt)}
                          </span>
                        )}
                      </Td>
                      <Td
                        align="right"
                        className={`tabular-nums font-semibold ${
                          row.amount >= 0 ? "text-emerald-600" : "text-slate-600"
                        }`}
                      >
                        {row.amount >= 0 ? "+" : "−"}
                        {formatCurrency(Math.abs(row.amount))}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Request a disbursement">
            {isOwner ? (
              <PayoutRequest
                withdrawable={balance.withdrawable}
                minimum={settings.minPayoutAmount}
                bankVerified={Boolean(vendor?.bank.verified)}
                hasBank={Boolean(vendor?.bank.accountNumber)}
              />
            ) : (
              <p className="text-sm text-slate-500">Only the account owner can request money.</p>
            )}
          </Card>

          <Card title="Disbursement history">
            {payouts.length === 0 ? (
              <p className="text-sm text-slate-500">No requests yet.</p>
            ) : (
              <ul className="space-y-3">
                {payouts.map((p) => (
                  <li key={String(p._id)} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <StatusPill status={p.status} />
                      <p className="text-[11px] text-slate-400 mt-1">
                        {formatDate(p.createdAt.toISOString())}
                        {p.paymentReference && ` · ref ${p.paymentReference}`}
                      </p>
                      {p.rejectionReason && (
                        <p className="text-[11px] text-rose-600 mt-0.5">{p.rejectionReason}</p>
                      )}
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums shrink-0">
                      {formatCurrency(p.approvedAmount ?? p.requestedAmount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
