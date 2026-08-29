import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, History } from "lucide-react";
import { PageHeader, Card, StatusPill } from "@/components/admin/Shell";
import { requirePlatform, canPlatform } from "@/lib/auth/guards";
import { getHotelForAdmin } from "@/lib/services/admin-data";
import { listAuditLogs } from "@/lib/services/admin-data";
import { readSettings } from "@/lib/services/settings";
import { formatDate } from "@/lib/utils/formatters";
import RatingControl from "@/components/admin/RatingControl";
import HotelModeration from "@/components/admin/HotelModeration";

export default function HotelAdminPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
      <Body params={params} />
    </Suspense>
  );
}

async function Body({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requirePlatform();
  const result = await getHotelForAdmin(id);
  if (!result) notFound();

  const { hotel, vendor } = result;
  const settings = await readSettings();
  const isSuper = canPlatform(admin, ["super_admin"]);
  const canModerate = canPlatform(admin, ["super_admin", "ops"]);
  const { logs } = await listAuditLogs({ entity: "Hotel", page: 1 });
  const hotelLogs = logs.filter((l) => l.entityId === id).slice(0, 8);

  const adjusted = hotel.ratingAdjustment.mode !== "none";

  return (
    <>
      <PageHeader
        title={hotel.name}
        subtitle={`${hotel.location} · ${hotel.city} · ${vendor?.businessName ?? "Unknown vendor"}`}
        breadcrumb={[{ label: "Properties", href: "/admin/hotels" }, { label: hotel.name }]}
        action={<StatusPill status={hotel.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="What guests actually rated" description="Computed from published reviews. This value is never edited.">
            <div className="flex flex-wrap items-center gap-8">
              <div>
                <p className="text-xs text-slate-500 mb-1">True average</p>
                <p className="text-4xl font-bold text-slate-900 tabular-nums">
                  {hotel.reviewStats.count > 0 ? hotel.reviewStats.avg.toFixed(2) : "—"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {hotel.reviewStats.count} published review{hotel.reviewStats.count === 1 ? "" : "s"}
                </p>
              </div>
              <div className="text-slate-300 text-2xl" aria-hidden="true">→</div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Shown publicly</p>
                <p className={`text-4xl font-bold tabular-nums ${adjusted ? "text-amber-600" : "text-slate-900"}`}>
                  {hotel.displayReviewCount > 0 || adjusted ? hotel.displayRating.toFixed(1) : "—"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {hotel.displayReviewCount} review{hotel.displayReviewCount === 1 ? "" : "s"}
                </p>
              </div>
              {adjusted && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 max-w-sm">
                  <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-1">
                    Adjusted
                  </p>
                  <p className="text-sm text-amber-900">
                    {hotel.ratingAdjustment.mode === "override"
                      ? `Overridden to ${hotel.ratingAdjustment.value.toFixed(1)}`
                      : `Offset by ${hotel.ratingAdjustment.value > 0 ? "+" : ""}${hotel.ratingAdjustment.value.toFixed(1)}`}
                    {hotel.ratingAdjustment.seedCount > 0 &&
                      `, +${hotel.ratingAdjustment.seedCount} to the count`}
                  </p>
                  {hotel.ratingAdjustment.reason && (
                    <p className="text-xs text-amber-800 mt-1">{hotel.ratingAdjustment.reason}</p>
                  )}
                  {hotel.ratingAdjustment.setAt && (
                    <p className="text-[11px] text-amber-700 mt-1">
                      Set {formatDate(new Date(hotel.ratingAdjustment.setAt).toISOString())}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {isSuper ? (
            <Card
              title="Rating control"
              description={`Offsets are capped at ±${settings.maxRatingOffset.toFixed(1)}. Every change is written to the audit log with your name against it.`}
            >
              <RatingControl
                hotelId={id}
                mode={hotel.ratingAdjustment.mode}
                value={hotel.ratingAdjustment.value}
                seedCount={hotel.ratingAdjustment.seedCount}
                reason={hotel.ratingAdjustment.reason ?? ""}
                trueAvg={hotel.reviewStats.avg}
                trueCount={hotel.reviewStats.count}
                maxOffset={settings.maxRatingOffset}
              />
            </Card>
          ) : (
            <Card title="Rating control">
              <p className="text-sm text-slate-500">
                Only a super admin can adjust what a property displays.
              </p>
            </Card>
          )}

          <Card title="Listing">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ["Property type", hotel.propertyType.replace(/_/g, " ")],
                ["Official class", `${hotel.starCategory}-star`],
                ["Address", hotel.address],
                ["Photos", String(hotel.images.length)],
                ["Amenities", hotel.amenities.slice(0, 6).join(", ") || "None"],
                ["Check-in / out", `${hotel.policies.checkInTime} / ${hotel.policies.checkOutTime}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-800 capitalize">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-slate-600 mt-4 pt-4 border-t border-slate-100">
              {hotel.description}
            </p>
          </Card>
        </div>

        <div className="space-y-6">
          {canModerate && (
            <Card title="Moderation">
              <HotelModeration
                hotelId={id}
                status={hotel.status}
                hasRevision={Boolean(hotel.pendingRevision)}
                imageCount={hotel.images.length}
              />
            </Card>
          )}

          <Card title="History" description="Everything done to this listing.">
            {hotelLogs.length === 0 ? (
              <p className="text-sm text-slate-500">Nothing recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {hotelLogs.map((log) => (
                  <li key={String(log._id)} className="flex gap-2.5">
                    <History size={14} className="text-slate-300 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        {log.action.replace(/\./g, " ").replace(/_/g, " ")}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {log.actorName} · {formatDate(log.createdAt.toISOString())}
                      </p>
                      {log.reason && <p className="text-xs text-slate-600 mt-0.5">{log.reason}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {isSuper && (
            <Link
              href="/admin/ratings"
              className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              <Star size={15} /> All adjusted ratings
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
