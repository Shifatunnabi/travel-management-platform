import { Suspense } from "react";
import { Star, MessageSquare } from "lucide-react";
import { PageHeader, Card, EmptyState, StatusPill } from "@/components/admin/Shell";
import { requireVendor } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/connect";
import { Review } from "@/lib/models/Review";
import { Hotel } from "@/lib/models/Hotel";
import { formatDate } from "@/lib/utils/formatters";
import VendorReviewReply from "@/components/vendor/VendorReviewReply";

export default function VendorReviewsPage() {
  return (
    <>
      <PageHeader
        title="Reviews"
        subtitle="What guests said, and your chance to respond. You cannot edit or remove a review."
      />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body />
      </Suspense>
    </>
  );
}

async function Body() {
  const user = await requireVendor();
  await connectDB();

  const reviews = await Review.find({ vendorId: user.vendorId, status: "published" })
    .sort({ vendorReply: 1, createdAt: -1 })
    .limit(100)
    .lean();

  if (reviews.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Guests can review a stay once it is complete and the platform has checked it."
        />
      </Card>
    );
  }

  const hotels = await Hotel.find({ _id: { $in: reviews.map((r) => r.hotelId) } })
    .select("name")
    .lean();
  const names = new Map(hotels.map((h) => [String(h._id), h.name]));
  const canReply = user.vendorRole === "owner" || user.vendorRole === "manager";

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <Card key={String(r._id)}>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 font-bold text-slate-900 tabular-nums">
              <Star size={14} className="text-amber-500 fill-amber-500" aria-hidden="true" />
              {r.rating}
            </span>
            <span className="text-xs text-slate-500">{names.get(String(r.hotelId))}</span>
            {r.reported && <StatusPill status="pending" />}
          </div>

          {r.title && <p className="font-semibold text-slate-900">{r.title}</p>}
          <p className="text-sm text-slate-600 mt-1">{r.body}</p>
          <p className="text-xs text-slate-400 mt-2">
            {r.authorName}
            {r.tripType && ` · ${r.tripType}`} · {formatDate(r.createdAt.toISOString())}
          </p>

          {r.vendorReply ? (
            <div className="mt-3 pl-3 border-l-2 border-brand-200">
              <p className="text-[11px] font-semibold text-brand-700">Your reply</p>
              <p className="text-sm text-slate-600 mt-0.5">{r.vendorReply.body}</p>
            </div>
          ) : r.reported ? (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Reported to the platform team — they will review it.
            </p>
          ) : canReply ? (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <VendorReviewReply reviewId={String(r._id)} />
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-400">
              <MessageSquare size={11} className="inline mr-1" aria-hidden="true" />
              Owners and managers can reply.
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
