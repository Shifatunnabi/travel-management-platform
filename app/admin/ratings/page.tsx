import { Suspense } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { PageHeader, Card, EmptyState, TableWrap, Th, Td } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { listAdjustedRatings } from "@/lib/services/admin-data";
import { formatDate } from "@/lib/utils/formatters";

export default function RatingsOverviewPage() {
  return (
    <>
      <PageHeader
        title="Rating control"
        subtitle="Every property whose displayed rating differs from what guests actually rated."
      />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body />
      </Suspense>
    </>
  );
}

async function Body() {
  await requirePlatform(["super_admin"]);
  const hotels = await listAdjustedRatings();

  if (hotels.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Star}
          title="No adjustments in place"
          description="Every property is showing its true guest average. Adjustments made from a property's page appear here."
        />
      </Card>
    );
  }

  return (
    <Card>
      <TableWrap>
        <thead>
          <tr className="border-b border-slate-100">
            <Th>Property</Th>
            <Th align="right">True</Th>
            <Th align="right">Displayed</Th>
            <Th>Adjustment</Th>
            <Th>Reason</Th>
            <Th align="right">Set</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {hotels.map((h) => (
            <tr key={String(h._id)} className="hover:bg-slate-50/60">
              <Td>
                <Link
                  href={`/admin/hotels/${h._id}/rating`}
                  className="font-semibold text-slate-900 hover:text-brand-600"
                >
                  {h.name}
                </Link>
                <p className="text-xs text-slate-500">{h.city}</p>
              </Td>
              <Td align="right" className="tabular-nums text-slate-600">
                {h.reviewStats.avg.toFixed(2)}
                <span className="text-xs text-slate-400"> ({h.reviewStats.count})</span>
              </Td>
              <Td align="right" className="tabular-nums font-bold text-amber-600">
                {h.displayRating.toFixed(1)}
                <span className="text-xs text-slate-400 font-normal"> ({h.displayReviewCount})</span>
              </Td>
              <Td className="text-slate-600 capitalize">
                {h.ratingAdjustment.mode === "override"
                  ? `Override ${h.ratingAdjustment.value.toFixed(1)}`
                  : `Offset ${h.ratingAdjustment.value > 0 ? "+" : ""}${h.ratingAdjustment.value.toFixed(1)}`}
                {h.ratingAdjustment.seedCount > 0 && ` · +${h.ratingAdjustment.seedCount} count`}
              </Td>
              <Td className="text-slate-600 max-w-56">{h.ratingAdjustment.reason ?? "—"}</Td>
              <Td align="right" className="text-xs text-slate-500">
                {h.ratingAdjustment.setAt
                  ? formatDate(new Date(h.ratingAdjustment.setAt).toISOString())
                  : "—"}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </Card>
  );
}
