import { Suspense } from "react";
import Link from "next/link";
import { Store } from "lucide-react";
import { PageHeader, Card, EmptyState, StatusPill, TableWrap, Th, Td } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { listVendors } from "@/lib/services/admin-data";
import { formatDate } from "@/lib/utils/formatters";
import FilterTabs from "@/components/admin/FilterTabs";

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
  { value: "all", label: "All" },
];

export default function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <>
      <PageHeader title="Vendors" subtitle="Partner businesses and their approval state." />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <VendorList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function VendorList({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requirePlatform();
  const { status = "pending" } = await searchParams;
  const vendors = await listVendors(status);

  return (
    <div className="space-y-4">
      <FilterTabs basePath="/admin/vendors" param="status" current={status} tabs={TABS} />
      <Card>
        {vendors.length === 0 ? (
          <EmptyState
            icon={Store}
            title={status === "pending" ? "No applications waiting" : "Nothing here"}
            description={
              status === "pending"
                ? "New partner applications will appear here for review."
                : "No vendors match this filter."
            }
          />
        ) : (
          <TableWrap>
            <thead>
              <tr className="border-b border-slate-100">
                <Th>Business</Th>
                <Th>Contact</Th>
                <Th>Status</Th>
                <Th align="right">Properties</Th>
                <Th align="right">Commission</Th>
                <Th align="right">Applied</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {vendors.map((v) => (
                <tr key={String(v._id)} className="hover:bg-slate-50/60">
                  <Td>
                    <Link
                      href={`/admin/vendors/${v._id}`}
                      className="font-semibold text-slate-900 hover:text-brand-600"
                    >
                      {v.businessName}
                    </Link>
                    <p className="text-xs text-slate-500">{v.city}</p>
                  </Td>
                  <Td>
                    <p className="text-slate-700">{v.contactEmail}</p>
                    <p className="text-xs text-slate-500">{v.contactPhone}</p>
                  </Td>
                  <Td>
                    <StatusPill status={v.status} />
                    {!v.bank.verified && v.status === "approved" && (
                      <p className="text-[11px] text-amber-600 mt-1">Bank unverified</p>
                    )}
                  </Td>
                  <Td align="right" className="tabular-nums text-slate-700">
                    {v.liveCount} live
                    <span className="text-slate-400"> / {v.hotelCount}</span>
                  </Td>
                  <Td align="right" className="tabular-nums text-slate-700">
                    {v.commissionPct != null ? `${v.commissionPct}%` : "Default"}
                  </Td>
                  <Td align="right" className="text-slate-500 text-xs">
                    {formatDate(v.createdAt.toISOString())}
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
