import { Suspense } from "react";
import Link from "next/link";
import { FileClock } from "lucide-react";
import { PageHeader, Card, EmptyState, TableWrap, Th, Td } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { listAuditLogs } from "@/lib/services/admin-data";
import FilterTabs from "@/components/admin/FilterTabs";

const TABS = [
  { value: "all", label: "Everything" },
  { value: "Hotel", label: "Properties" },
  { value: "Vendor", label: "Vendors" },
  { value: "Review", label: "Reviews" },
  { value: "Payout", label: "Disbursements" },
  { value: "Booking", label: "Bookings" },
  { value: "Settings", label: "Settings" },
  { value: "User", label: "Users" },
];

export default function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; page?: string }>;
}) {
  return (
    <>
      <PageHeader title="Audit log" subtitle="Every privileged action, with who did it and what changed." />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Body({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; page?: string }>;
}) {
  await requirePlatform();
  const { entity = "all", page: pageParam } = await searchParams;
  const { logs, page, pages, total } = await listAuditLogs({
    entity,
    page: Number(pageParam) || 1,
  });

  return (
    <div className="space-y-4">
      <FilterTabs basePath="/admin/audit" param="entity" current={entity} tabs={TABS} />
      <Card>
        {logs.length === 0 ? (
          <EmptyState icon={FileClock} title="Nothing recorded" description="Privileged actions are written here as they happen." />
        ) : (
          <>
            <TableWrap>
              <thead>
                <tr className="border-b border-slate-100">
                  <Th>When</Th>
                  <Th>Who</Th>
                  <Th>Action</Th>
                  <Th>Target</Th>
                  <Th>Detail</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((l) => (
                  <tr key={String(l._id)} className="hover:bg-slate-50/60">
                    <Td className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString("en-GB", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </Td>
                    <Td>
                      <p className="font-medium text-slate-800">{l.actorName}</p>
                      <p className="text-[11px] text-slate-400">{l.actorRole}</p>
                    </Td>
                    <Td>
                      <code className="text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {l.action}
                      </code>
                    </Td>
                    <Td className="text-xs text-slate-500">
                      {l.entity}
                      {l.entityId && (
                        <span className="block font-mono text-[10px] text-slate-400">
                          {String(l.entityId).slice(-8)}
                        </span>
                      )}
                    </Td>
                    <Td className="text-xs text-slate-600 max-w-md">
                      {l.reason ?? <AuditDiff before={l.before} after={l.after} />}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>

            <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500 tabular-nums">
                Page {page} of {pages} · {total} entries
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/audit?entity=${entity}&page=${page - 1}`}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Previous
                  </Link>
                )}
                {page < pages && (
                  <Link
                    href={`/admin/audit?entity=${entity}&page=${page + 1}`}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

/** Shows only what actually changed, rather than dumping both documents. */
function AuditDiff({ before, after }: { before?: unknown; after?: unknown }) {
  if (!after || typeof after !== "object") return <span className="text-slate-400">—</span>;
  const a = after as Record<string, unknown>;
  const b = (before ?? {}) as Record<string, unknown>;

  const changes = Object.keys(a)
    .filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]))
    .slice(0, 4);

  if (changes.length === 0) return <span className="text-slate-400">—</span>;

  return (
    <span className="space-y-0.5 block">
      {changes.map((k) => (
        <span key={k} className="block truncate">
          <span className="text-slate-400">{k}:</span>{" "}
          {b[k] !== undefined && (
            <>
              <span className="line-through text-slate-400">{fmt(b[k])}</span>{" "}
              <span aria-hidden="true">→</span>{" "}
            </>
          )}
          <span className="font-medium text-slate-700">{fmt(a[k])}</span>
        </span>
      ))}
    </span>
  );
}

function fmt(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value).slice(0, 60);
  return String(value).slice(0, 40);
}
