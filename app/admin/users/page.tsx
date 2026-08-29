import { Suspense } from "react";
import { Users } from "lucide-react";
import { PageHeader, Card, EmptyState, StatusPill, TableWrap, Th, Td } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { listUsers } from "@/lib/services/admin-data";
import { formatDate } from "@/lib/utils/formatters";
import FilterTabs from "@/components/admin/FilterTabs";
import UserStatusToggle from "@/components/admin/UserStatusToggle";

const TABS = [
  { value: "customer", label: "Customers" },
  { value: "vendor", label: "Partners" },
  { value: "platform", label: "Staff" },
  { value: "all", label: "All" },
];

export default function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  return (
    <>
      <PageHeader title="Users" subtitle="Every account on the platform." />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Body({ searchParams }: { searchParams: Promise<{ role?: string; q?: string }> }) {
  const admin = await requirePlatform();
  const { role = "customer", q } = await searchParams;
  const users = await listUsers(role, q);
  const canSuspend = admin.platformRole === "super_admin" || admin.platformRole === "ops";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <FilterTabs basePath="/admin/users" param="role" current={role} tabs={TABS} />
        <form action="/admin/users" className="sm:ml-auto flex gap-2">
          <input type="hidden" name="role" value={role} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email"
            aria-label="Search users"
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500 min-w-56"
          />
          <button
            type="submit"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 rounded-xl transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <Card>
        {users.length === 0 ? (
          <EmptyState icon={Users} title="No accounts found" description="Try a different filter or search term." />
        ) : (
          <TableWrap>
            <thead>
              <tr className="border-b border-slate-100">
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th align="right">Joined</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={String(u._id)} className="hover:bg-slate-50/60">
                  <Td>
                    <p className="font-medium text-slate-800">{u.name}</p>
                    {u.phone && <p className="text-xs text-slate-500">{u.phone}</p>}
                  </Td>
                  <Td>
                    <span className="text-slate-700">{u.email}</span>
                    {!u.emailVerifiedAt && (
                      <span className="block text-[11px] text-amber-600">Unverified</span>
                    )}
                  </Td>
                  <Td className="capitalize text-slate-600">
                    {u.role}
                    {u.platformRole && (
                      <span className="block text-[11px] text-slate-400">
                        {u.platformRole.replace(/_/g, " ")}
                      </span>
                    )}
                  </Td>
                  <Td><StatusPill status={u.status} /></Td>
                  <Td align="right" className="text-xs text-slate-500">
                    {formatDate(u.createdAt.toISOString())}
                  </Td>
                  <Td align="right">
                    {canSuspend && String(u._id) !== admin.id && (
                      <UserStatusToggle userId={String(u._id)} suspended={u.status === "suspended"} />
                    )}
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
