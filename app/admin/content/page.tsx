import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Building2, MapPin } from "lucide-react";
import { PageHeader, Card, EmptyState, TableWrap, Th, Td, Thumb } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/connect";
import { Hotel } from "@/lib/models/Hotel";
import { getDestinationCities } from "@/lib/services/public-hotels";
import { cdn } from "@/lib/services/cloudinary";
import { formatCurrency } from "@/lib/utils/formatters";
import FeatureToggle from "@/components/admin/FeatureToggle";

export default function AdminContentPage() {
  return (
    <>
      <PageHeader
        title="Content"
        subtitle="What the homepage shows: which properties are featured, and where people can search."
      />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body />
      </Suspense>
    </>
  );
}

async function Body() {
  await requirePlatform(["super_admin", "ops"]);
  await connectDB();

  const [featured, candidates, cities] = await Promise.all([
    Hotel.find({ status: "published", featured: true })
      .select("name city images displayRating priceFrom featured")
      .lean(),
    Hotel.find({ status: "published", featured: false })
      .select("name city images displayRating priceFrom featured")
      .sort({ displayRating: -1 })
      .limit(20)
      .lean(),
    getDestinationCities(),
  ]);

  return (
    <div className="space-y-6">
      <Card
        title="Featured on the homepage"
        description="Featured properties lead the Popular Hotels rail; the rest are ordered by rating."
      >
        {featured.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Nothing featured"
            description="The homepage falls back to the highest-rated live properties."
          />
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((h) => (
              <li key={String(h._id)} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="relative aspect-[4/3] bg-slate-100">
                  {h.images[0] && (
                    <Image
                      src={cdn(h.images[0].url, 400, 300)}
                      alt={h.name}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-slate-900 text-sm truncate">{h.name}</p>
                  <p className="text-[11px] text-slate-500">{h.city}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-slate-700 tabular-nums">
                      {formatCurrency(h.priceFrom)}
                    </span>
                    <FeatureToggle hotelId={String(h._id)} featured />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Available to feature" description="The highest-rated live properties not currently featured.">
            {candidates.length === 0 ? (
              <EmptyState icon={Building2} title="Nothing to add" description="Every live property is already featured." />
            ) : (
              <TableWrap>
                <thead>
                  <tr className="border-b border-slate-100">
                    <Th>Property</Th>
                    <Th align="right">Rating</Th>
                    <Th align="right">From</Th>
                    <Th align="right">Feature</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {candidates.map((h) => (
                    <tr key={String(h._id)} className="hover:bg-slate-50/60">
                      <Td>
                        <div className="flex items-center gap-3">
                          <Thumb src={h.images[0] ? cdn(h.images[0].url, 80, 80) : undefined} alt="" size={36} />
                          <div>
                            <Link
                              href={`/admin/hotels/${h._id}/rating`}
                              className="font-medium text-slate-800 hover:text-brand-600"
                            >
                              {h.name}
                            </Link>
                            <p className="text-[11px] text-slate-500">{h.city}</p>
                          </div>
                        </div>
                      </Td>
                      <Td align="right" className="tabular-nums text-slate-700">
                        {h.displayRating ? h.displayRating.toFixed(1) : "—"}
                      </Td>
                      <Td align="right" className="tabular-nums text-slate-700">
                        {formatCurrency(h.priceFrom)}
                      </Td>
                      <Td align="right">
                        <FeatureToggle hotelId={String(h._id)} featured={false} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </Card>
        </div>

        <Card title="Destinations" description="Cities with live inventory, as offered in search.">
          {cities.length === 0 ? (
            <p className="text-sm text-slate-500">No published properties yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {cities.map((c) => (
                <li key={c.city} className="flex items-center gap-2.5">
                  <MapPin size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
                  <Link
                    href={`/hotels/search?destination=${encodeURIComponent(c.city)}`}
                    className="flex-1 text-sm font-medium text-slate-700 hover:text-brand-600"
                  >
                    {c.city}
                  </Link>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {c.count} · from {formatCurrency(c.from)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
