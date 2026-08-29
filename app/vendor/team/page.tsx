import { Suspense } from "react";
import { Users } from "lucide-react";
import { PageHeader, Card, EmptyState, StatusPill, TableWrap, Th, Td } from "@/components/admin/Shell";
import { requireVendor } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/connect";
import { VendorMember } from "@/lib/models/Vendor";
import { User } from "@/lib/models/User";
import { formatDate } from "@/lib/utils/formatters";
import TeamInvite from "@/components/vendor/TeamInvite";
import RemoveMember from "@/components/vendor/RemoveMember";

const ROLE_REACH: Record<string, string> = {
  owner: "Everything, including finance and payouts",
  manager: "Properties, rooms, rates, bookings, reviews",
  staff: "Bookings and check-in only",
};

export default function VendorTeamPage() {
  return (
    <>
      <PageHeader title="Team" subtitle="Who can act for your business, and how far each role reaches." />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body />
      </Suspense>
    </>
  );
}

async function Body() {
  const owner = await requireVendor(["owner"]);
  await connectDB();

  const members = await VendorMember.find({ vendorId: owner.vendorId }).sort({ createdAt: 1 }).lean();
  const users = await User.find({ _id: { $in: members.map((m) => m.userId) } })
    .select("name email status emailVerifiedAt createdAt")
    .lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card title="Team members">
          {members.length === 0 ? (
            <EmptyState icon={Users} title="Just you so far" description="Invite colleagues using the form beside this." />
          ) : (
            <TableWrap>
              <thead>
                <tr className="border-b border-slate-100">
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th align="right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {members.map((m) => {
                  const user = byId.get(String(m.userId));
                  if (!user) return null;
                  return (
                    <tr key={String(m._id)}>
                      <Td className="font-medium text-slate-800">{user.name}</Td>
                      <Td>
                        <span className="text-slate-600">{user.email}</span>
                        {!user.emailVerifiedAt && (
                          <span className="block text-[11px] text-amber-600">Not yet signed in</span>
                        )}
                      </Td>
                      <Td>
                        <span className="capitalize font-medium text-slate-700">{m.role}</span>
                        <p className="text-[11px] text-slate-400 max-w-56">{ROLE_REACH[m.role]}</p>
                      </Td>
                      <Td><StatusPill status={user.status} /></Td>
                      <Td align="right">
                        {m.role !== "owner" && <RemoveMember userId={String(m.userId)} name={user.name} />}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
          )}
        </Card>
      </div>

      <Card title="Invite someone">
        <TeamInvite />
      </Card>
    </div>
  );
}
