import { Suspense } from "react";
import Link from "next/link";
import { TrendingUp, Wallet, Banknote, Clock } from "lucide-react";
import { PageHeader, StatCard, Card, TableWrap, Th, Td, EmptyState } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/connect";
import { LedgerEntry } from "@/lib/models/Ledger";
import { Vendor } from "@/lib/models/Vendor";
import { formatCurrency } from "@/lib/utils/formatters";

export default function AdminFinancePage() {
  return (
    <>
      <PageHeader title="Finance" subtitle="Commission earned, money owed, and what has been paid out." />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body />
      </Suspense>
    </>
  );
}

async function Body() {
  await requirePlatform(["super_admin", "finance"]);
  await connectDB();

  const [totals, perVendor, vendors] = await Promise.all([
    LedgerEntry.aggregate<{ _id: string; total: number }>([
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]),
    LedgerEntry.aggregate<{ _id: string; earning: number; commission: number; payout: number }>([
      {
        $group: {
          _id: "$vendorId",
          earning: { $sum: { $cond: [{ $eq: ["$type", "earning"] }, "$amount", 0] } },
          commission: { $sum: { $cond: [{ $eq: ["$type", "commission"] }, "$amount", 0] } },
          payout: { $sum: { $cond: [{ $eq: ["$type", "payout"] }, "$amount", 0] } },
        },
      },
      { $sort: { earning: -1 } },
      { $limit: 50 },
    ]),
    Vendor.find().select("businessName commissionPct").lean(),
  ]);

  const byType = new Map(totals.map((t) => [t._id, t.total]));
  const commission = Math.abs(byType.get("commission") ?? 0);
  const reversed = byType.get("commission_reversal") ?? 0;
  const earned = byType.get("earning") ?? 0;
  const refunded = Math.abs(byType.get("refund") ?? 0);
  const paidOut = Math.abs(byType.get("payout") ?? 0);
  const owed = earned - refunded - paidOut;

  const names = new Map(vendors.map((v) => [String(v._id), v]));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Net commission"
          value={formatCurrency(commission - reversed)}
          icon={TrendingUp}
          tone="emerald"
          hint={reversed > 0 ? `${formatCurrency(reversed)} reversed on refunds` : "All time"}
        />
        <StatCard label="Partner earnings" value={formatCurrency(earned)} icon={Wallet} tone="brand" />
        <StatCard label="Paid out" value={formatCurrency(paidOut)} icon={Banknote} tone="slate" />
        <StatCard
          label="Owed to partners"
          value={formatCurrency(Math.max(0, owed))}
          icon={Clock}
          tone={owed > 0 ? "amber" : "slate"}
          hint="Earned, not yet disbursed"
        />
      </div>

      <Card title="By partner" description="Where the money sits, vendor by vendor.">
        {perVendor.length === 0 ? (
          <EmptyState icon={Wallet} title="No ledger activity" description="Entries appear as bookings are confirmed." />
        ) : (
          <TableWrap>
            <thead>
              <tr className="border-b border-slate-100">
                <Th>Partner</Th>
                <Th align="right">Rate</Th>
                <Th align="right">Earned</Th>
                <Th align="right">Our commission</Th>
                <Th align="right">Paid out</Th>
                <Th align="right">Outstanding</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {perVendor.map((row) => {
                const vendor = names.get(row._id);
                const outstanding = row.earning + row.payout;
                return (
                  <tr key={row._id} className="hover:bg-slate-50/60">
                    <Td>
                      <Link
                        href={`/admin/vendors/${row._id}`}
                        className="font-medium text-slate-800 hover:text-brand-600"
                      >
                        {vendor?.businessName ?? "Unknown"}
                      </Link>
                    </Td>
                    <Td align="right" className="tabular-nums text-slate-600">
                      {vendor?.commissionPct != null ? `${vendor.commissionPct}%` : "Default"}
                    </Td>
                    <Td align="right" className="tabular-nums text-slate-800">
                      {formatCurrency(row.earning)}
                    </Td>
                    <Td align="right" className="tabular-nums text-emerald-600 font-semibold">
                      {formatCurrency(Math.abs(row.commission))}
                    </Td>
                    <Td align="right" className="tabular-nums text-slate-600">
                      {formatCurrency(Math.abs(row.payout))}
                    </Td>
                    <Td align="right" className="tabular-nums font-bold text-slate-900">
                      {formatCurrency(Math.max(0, outstanding))}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  );
}
