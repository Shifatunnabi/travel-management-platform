import { Suspense } from "react";
import Link from "next/link";
import { Building2, Star, Sliders } from "lucide-react";
import { PageHeader, Card, EmptyState, StatusPill, TableWrap, Th, Td, Thumb } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { listHotelsForModeration } from "@/lib/services/admin-data";
import { formatCurrency } from "@/lib/utils/formatters";
import { cdn } from "@/lib/services/cloudinary";
import FilterTabs from "@/components/admin/FilterTabs";
import FeatureToggle from "@/components/admin/FeatureToggle";

const TABS = [
  { value: "pending_review", label: "Awaiting review" },
  { value: "revisions", label: "Edits queued" },
  { value: "published", label: "Live" },
  { value: "draft", label: "Drafts" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export default function AdminHotelsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <>
      <PageHeader title="Properties" subtitle="Moderation queue and every listing on the platform." />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <HotelList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function HotelList({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const admin = await requirePlatform();
  const { status = "pending_review" } = await searchParams;
  const hotels = await listHotelsForModeration(status);
  const isSuper = admin.platformRole === "super_admin";
  const canModerate = isSuper || admin.platformRole === "ops";

  return (
    <div className="space-y-4">
      <FilterTabs basePath="/admin/hotels" param="status" current={status} tabs={TABS} />
      <Card>
        {hotels.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={status === "pending_review" ? "Nothing waiting for review" : "Nothing here"}
            description={
              status === "pending_review"
                ? "New listings and queued edits appear here for approval."
                : "No properties match this filter."
            }
          />
        ) : (
          <TableWrap>
            <thead>
              <tr className="border-b border-slate-100">
                <Th>Property</Th>
                <Th>Vendor</Th>
                <Th>Status</Th>
                <Th align="right">Rating shown</Th>
                <Th align="right">From</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {hotels.map((h) => {
                const adjusted = h.ratingAdjustment.mode !== "none";
                return (
                  <tr key={String(h._id)} className="hover:bg-slate-50/60">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Thumb src={h.images[0] ? cdn(h.images[0].url, 88, 88) : undefined} alt="" />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/hotels/${h._id}/rating`}
                            className="font-semibold text-slate-900 hover:text-brand-600 block truncate"
                          >
                            {h.name}
                          </Link>
                          <p className="text-xs text-slate-500">{h.city} · {h.starCategory}-star</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-slate-600">{h.vendorName}</Td>
                    <Td>
                      <StatusPill status={h.status} />
                      {h.pendingRevision && (
                        <p className="text-[11px] text-amber-600 font-medium mt-1">Edit queued</p>
                      )}
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {h.displayReviewCount > 0 || adjusted ? (
                        <>
                          <span className={`font-semibold ${adjusted ? "text-amber-600" : "text-slate-900"}`}>
                            {h.displayRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-slate-400"> ({h.displayReviewCount})</span>
                          {adjusted && (
                            <p className="text-[11px] text-slate-400">
                              true {h.reviewStats.avg.toFixed(1)} ({h.reviewStats.count})
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </Td>
                    <Td align="right" className="tabular-nums text-slate-700">
                      {h.priceFrom ? formatCurrency(h.priceFrom) : "—"}
                    </Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-1">
                        {canModerate && h.status === "published" && (
                          <FeatureToggle hotelId={String(h._id)} featured={h.featured} />
                        )}
                        {isSuper && (
                          <Link
                            href={`/admin/hotels/${h._id}/rating`}
                            title="Rating control"
                            className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Star size={15} />
                          </Link>
                        )}
                        <Link
                          href={`/admin/hotels/${h._id}/rating`}
                          title="Review this listing"
                          className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <Sliders size={15} />
                        </Link>
                      </div>
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
