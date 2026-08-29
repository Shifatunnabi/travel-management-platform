import { Suspense } from "react";
import { CreditCard, AlertTriangle } from "lucide-react";
import { PageHeader, Card, EmptyState, StatusPill, TableWrap, Th, Td } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/connect";
import { Payment } from "@/lib/models/Payment";
import { Booking } from "@/lib/models/Booking";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { PaymentStatus } from "@/lib/models/types";
import FilterTabs from "@/components/admin/FilterTabs";

const TABS = [
  { value: "success", label: "Successful" },
  { value: "failed", label: "Failed" },
  { value: "initiated", label: "Abandoned" },
  { value: "refunded", label: "Refunded" },
  { value: "reconcile", label: "Needs attention" },
  { value: "all", label: "All" },
];

export default function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Every gateway transaction, and anything that does not line up."
      />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Body({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requirePlatform(["super_admin", "finance", "ops"]);
  const { status = "success" } = await searchParams;

  await connectDB();
  const query = status === "reconcile" || status === "all" ? {} : { status: status as PaymentStatus };
  const payments = await Payment.find(query).sort({ createdAt: -1 }).limit(300).lean();

  const bookings = await Booking.find({ _id: { $in: payments.map((p) => p.bookingId) } })
    .select("ref status pricing.grandTotal snapshot.hotelName")
    .lean();
  const byId = new Map(bookings.map((b) => [String(b._id), b]));

  // Anything where our record and the gateway's outcome disagree.
  const rows = payments
    .map((p) => {
      const booking = byId.get(String(p.bookingId));
      const orphan = !booking;
      const amountMismatch = booking ? booking.pricing.grandTotal !== p.amount : false;
      const paidButUnconfirmed =
        p.status === "success" && booking != null && booking.status === "pending_payment";
      return { p, booking, orphan, amountMismatch, paidButUnconfirmed };
    })
    .filter((r) => (status === "reconcile" ? r.orphan || r.amountMismatch || r.paidButUnconfirmed : true));

  return (
    <div className="space-y-4">
      <FilterTabs basePath="/admin/payments" param="status" current={status} tabs={TABS} />

      {status === "reconcile" && rows.length > 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold text-amber-900">
              {rows.length} transaction{rows.length === 1 ? "" : "s"} need looking at
            </p>
            <p className="text-sm text-amber-800 mt-0.5">
              A payment with no booking, an amount that does not match, or money taken without the
              booking being confirmed.
            </p>
          </div>
        </div>
      )}

      <Card>
        {rows.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title={status === "reconcile" ? "Everything reconciles" : "No transactions"}
            description={
              status === "reconcile"
                ? "Every payment matches a booking with the same amount."
                : "No payments match this filter."
            }
          />
        ) : (
          <TableWrap>
            <thead>
              <tr className="border-b border-slate-100">
                <Th>Transaction</Th>
                <Th>Booking</Th>
                <Th>Method</Th>
                <Th>Status</Th>
                <Th align="right">Amount</Th>
                <Th align="right">When</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map(({ p, booking, orphan, amountMismatch, paidButUnconfirmed }) => (
                <tr key={String(p._id)} className="hover:bg-slate-50/60">
                  <Td>
                    <span className="font-mono text-[11px] text-slate-700">{p.tranId}</span>
                    {p.bankTranId && (
                      <span className="block font-mono text-[10px] text-slate-400">
                        bank {p.bankTranId}
                      </span>
                    )}
                  </Td>
                  <Td>
                    {booking ? (
                      <>
                        <span className="font-mono text-xs text-slate-800">{booking.ref}</span>
                        <span className="block text-[11px] text-slate-500">
                          {booking.snapshot.hotelName}
                        </span>
                        {paidButUnconfirmed && (
                          <span className="block text-[11px] text-rose-600 font-semibold">
                            Paid but not confirmed
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-rose-600 font-semibold">Orphan — no booking</span>
                    )}
                  </Td>
                  <Td className="text-xs text-slate-600">
                    {p.cardType || "—"}
                    {p.cardIssuer && <span className="block text-slate-400">{p.cardIssuer}</span>}
                  </Td>
                  <Td>
                    <StatusPill status={p.status} />
                    {p.failureReason && (
                      <p className="text-[11px] text-slate-400 mt-1 max-w-48">{p.failureReason}</p>
                    )}
                  </Td>
                  <Td align="right" className="tabular-nums">
                    <span className={amountMismatch ? "font-bold text-rose-600" : "font-semibold text-slate-900"}>
                      {formatCurrency(p.amount, p.currency)}
                    </span>
                    {amountMismatch && booking && (
                      <span className="block text-[11px] text-rose-600">
                        booking says {formatCurrency(booking.pricing.grandTotal)}
                      </span>
                    )}
                  </Td>
                  <Td align="right" className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(p.createdAt.toISOString())}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  );
}
