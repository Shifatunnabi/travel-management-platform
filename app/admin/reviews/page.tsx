import { Suspense } from "react";
import { MessageSquareWarning, Star, Flag } from "lucide-react";
import { PageHeader, Card, EmptyState, StatusPill } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { listReviews } from "@/lib/services/admin-data";
import { formatDate } from "@/lib/utils/formatters";
import FilterTabs from "@/components/admin/FilterTabs";
import ReviewModeration from "@/components/admin/ReviewModeration";

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "reported", label: "Reported" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export default function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <>
      <PageHeader title="Reviews" subtitle="Guest reviews awaiting a decision, and anything a partner has reported." />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <ReviewList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ReviewList({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requirePlatform(["super_admin", "ops", "support"]);
  const { status = "pending" } = await searchParams;
  const reviews = await listReviews(status);

  return (
    <div className="space-y-4">
      <FilterTabs basePath="/admin/reviews" param="status" current={status} tabs={TABS} />

      {reviews.length === 0 ? (
        <Card>
          <EmptyState
            icon={MessageSquareWarning}
            title={status === "pending" ? "Nothing to moderate" : "Nothing here"}
            description={
              status === "pending"
                ? "New guest reviews land here before they appear on a listing."
                : "No reviews match this filter."
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={String(r._id)}>
              <div className="flex flex-col lg:flex-row gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-900 tabular-nums">
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                      {r.rating}
                    </span>
                    <StatusPill status={r.status} />
                    {r.reported && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                        <Flag size={11} /> Reported
                      </span>
                    )}
                  </div>
                  {r.title && <p className="font-semibold text-slate-900">{r.title}</p>}
                  <p className="text-sm text-slate-600 mt-1">{r.body}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {r.authorName} · {r.hotelName}
                    {r.hotelCity && `, ${r.hotelCity}`} · {formatDate(r.createdAt.toISOString())}
                  </p>
                  {r.reported && (
                    <p className="mt-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                      Partner reported this: {r.reported.reason}
                    </p>
                  )}
                  {r.vendorReply && (
                    <div className="mt-3 pl-3 border-l-2 border-slate-200">
                      <p className="text-[11px] font-semibold text-slate-500">Partner replied</p>
                      <p className="text-sm text-slate-600">{r.vendorReply.body}</p>
                    </div>
                  )}
                </div>

                <div className="lg:w-64 shrink-0">
                  <ReviewModeration reviewId={String(r._id)} status={r.status} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
