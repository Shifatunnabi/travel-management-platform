import { Suspense } from "react";
import { UserCog } from "lucide-react";
import { PageHeader, Card, EmptyState, StatusPill, TableWrap, Th, Td } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { listUsers } from "@/lib/services/admin-data";
import { formatDate } from "@/lib/utils/formatters";
import StaffForm from "@/components/admin/StaffForm";

const ROLE_DESCRIPTIONS: Record<string, string> = {
  super_admin: "Everything, including rating control and settings",
  ops: "Vendors, properties, reviews, bookings",
  finance: "Disbursements, ledger, bank verification",
  support: "Reviews and customer assistance",
};

export default function StaffPage() {
  return (
    <>
      <PageHeader title="Platform staff" subtitle="Who can act on behalf of Tofiza, and how far each role reaches." />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body />
      </Suspense>
    </>
  );
}

async function Body() {
  await requirePlatform(["super_admin"]);
  const staff = await listUsers("platform");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card title="Staff accounts">
          {staff.length === 0 ? (
            <EmptyState icon={UserCog} title="No staff yet" description="Add the first platform account using the form." />
          ) : (
            <TableWrap>
              <thead>
                <tr className="border-b border-slate-100">
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th align="right">Added</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staff.map((u) => (
                  <tr key={String(u._id)}>
                    <Td className="font-medium text-slate-800">{u.name}</Td>
                    <Td className="text-slate-600">{u.email}</Td>
                    <Td>
                      <span className="capitalize font-medium text-slate-700">
                        {u.platformRole?.replace(/_/g, " ")}
                      </span>
                      <p className="text-[11px] text-slate-400 max-w-56">
                        {ROLE_DESCRIPTIONS[u.platformRole ?? ""] ?? ""}
                      </p>
                    </Td>
                    <Td><StatusPill status={u.status} /></Td>
                    <Td align="right" className="text-xs text-slate-500">
                      {formatDate(u.createdAt.toISOString())}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Card>
      </div>

      <Card title="Add a staff account">
        <StaffForm />
      </Card>
    </div>
  );
}
