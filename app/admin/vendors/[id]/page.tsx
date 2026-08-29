import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, ShieldCheck, ShieldAlert } from "lucide-react";
import { PageHeader, Card, StatusPill, TableWrap, Th, Td } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { getVendorDetail } from "@/lib/services/admin-data";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import VendorDecision from "@/components/admin/VendorDecision";
import VerifyBankButton from "@/components/admin/VerifyBankButton";

export default function AdminVendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
      <Body params={params} />
    </Suspense>
  );
}

async function Body({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requirePlatform();
  const detail = await getVendorDetail(id);
  if (!detail) notFound();

  const { vendor, owner, hotels, ledger, payouts, bookingCount } = detail;
  const earnings = ledger.find((l) => l._id === "earning")?.total ?? 0;
  const commission = Math.abs(ledger.find((l) => l._id === "commission")?.total ?? 0);
  const paidOut = Math.abs(ledger.find((l) => l._id === "payout")?.total ?? 0);
  const canDecide = admin.platformRole === "super_admin" || admin.platformRole === "ops";
  const canVerifyBank = admin.platformRole === "super_admin" || admin.platformRole === "finance";

  return (
    <>
      <PageHeader
        title={vendor.businessName}
        subtitle={`${vendor.city} · joined ${formatDate(vendor.createdAt.toISOString())}`}
        breadcrumb={[{ label: "Vendors", href: "/admin/vendors" }, { label: vendor.businessName }]}
        action={<StatusPill status={vendor.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Business details">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ["Owner", owner ? `${owner.name} (${owner.email})` : "—"],
                ["Contact email", vendor.contactEmail],
                ["Contact phone", vendor.contactPhone],
                ["Address", vendor.address],
                ["Trade licence", vendor.tradeLicenceNo || "Not provided"],
                ["TIN", vendor.tin || "Not provided"],
                ["Commission", vendor.commissionPct != null ? `${vendor.commissionPct}% (agreed)` : "Platform default"],
                ["Bookings", String(bookingCount)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-800 break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title="Verification documents" description="Uploaded by the partner. Not shown publicly.">
            {vendor.kycDocuments.length === 0 ? (
              <p className="text-sm text-slate-500">No documents uploaded yet.</p>
            ) : (
              <ul className="space-y-2">
                {vendor.kycDocuments.map((d) => (
                  <li key={d.publicId} className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-2.5">
                    <FileText size={16} className="text-slate-400" />
                    <span className="flex-1 text-sm font-medium text-slate-700">{d.label}</span>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Open
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Properties">
            {hotels.length === 0 ? (
              <p className="text-sm text-slate-500">No properties yet.</p>
            ) : (
              <TableWrap>
                <thead>
                  <tr className="border-b border-slate-100">
                    <Th>Property</Th>
                    <Th>Status</Th>
                    <Th align="right">Rating</Th>
                    <Th align="right">From</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {hotels.map((h) => (
                    <tr key={String(h._id)}>
                      <Td>
                        <Link href={`/admin/hotels/${h._id}/rating`} className="font-medium text-slate-800 hover:text-brand-600">
                          {h.name}
                        </Link>
                        <p className="text-xs text-slate-500">{h.city}</p>
                      </Td>
                      <Td><StatusPill status={h.status} /></Td>
                      <Td align="right" className="tabular-nums">{h.displayRating ? h.displayRating.toFixed(1) : "—"}</Td>
                      <Td align="right" className="tabular-nums">{h.priceFrom ? formatCurrency(h.priceFrom) : "—"}</Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {canDecide && (
            <Card title="Decision">
              <VendorDecision
                vendorId={String(vendor._id)}
                status={vendor.status}
                commissionPct={vendor.commissionPct ?? null}
              />
            </Card>
          )}

          <Card
            title="Payout account"
            action={
              vendor.bank.verified ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  <ShieldCheck size={13} /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  <ShieldAlert size={13} /> Unverified
                </span>
              )
            }
          >
            {vendor.bank.accountNumber ? (
              <>
                <dl className="space-y-2 text-sm">
                  {[
                    ["Account name", vendor.bank.accountName],
                    ["Account number", vendor.bank.accountNumber],
                    ["Bank", vendor.bank.bankName],
                    ["Branch", vendor.bank.branch],
                    ["Routing", vendor.bank.routingNumber || "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="font-medium text-slate-800 text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
                {!vendor.bank.verified && canVerifyBank && (
                  <div className="mt-4">
                    <VerifyBankButton vendorId={String(vendor._id)} />
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500">No bank account on file.</p>
            )}
          </Card>

          <Card title="Money">
            <dl className="space-y-2.5 text-sm">
              {[
                ["Gross earnings", formatCurrency(earnings)],
                ["Platform commission", formatCurrency(commission)],
                ["Paid out", formatCurrency(paidOut)],
                ["Outstanding", formatCurrency(earnings - paidOut)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-bold text-slate-900 tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            {payouts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-2">Recent disbursements</p>
                <ul className="space-y-1.5">
                  {payouts.slice(0, 5).map((p) => (
                    <li key={String(p._id)} className="flex items-center justify-between gap-2 text-xs">
                      <StatusPill status={p.status} />
                      <span className="tabular-nums font-medium text-slate-700">
                        {formatCurrency(p.approvedAmount ?? p.requestedAmount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
