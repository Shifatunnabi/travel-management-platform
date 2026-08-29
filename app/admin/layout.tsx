import { Suspense } from "react";
import AdminSidebar, { type NavGroup } from "@/components/admin/AdminSidebar";
import { requirePlatform } from "@/lib/auth/guards";
import { getAdminSummary } from "@/lib/services/admin-data";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Suspense fallback={<SidebarSkeleton />}>
            <AdminNav />
          </Suspense>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

async function AdminNav() {
  const admin = await requirePlatform();
  const s = await getAdminSummary();
  const isSuper = admin.platformRole === "super_admin";
  const isFinance = isSuper || admin.platformRole === "finance";
  const isOps = isSuper || admin.platformRole === "ops";

  const groups: NavGroup[] = [
    { items: [{ href: "/admin", label: "Dashboard", icon: "dashboard", exact: true }] },
    {
      title: "Marketplace",
      items: [
        { href: "/admin/vendors", label: "Vendors", icon: "store", badge: s.vendorsPending },
        { href: "/admin/hotels", label: "Properties", icon: "building", badge: s.hotelsPending },
        { href: "/admin/reviews", label: "Reviews", icon: "reviews", badge: s.reviewsPending },
        ...(isSuper
          ? ([{ href: "/admin/ratings", label: "Rating control", icon: "star" }] as NavGroup["items"])
          : []),
      ],
    },
    {
      title: "Operations",
      items: [
        { href: "/admin/bookings", label: "Bookings", icon: "bookings" },
        { href: "/admin/payments", label: "Payments", icon: "payments", badge: s.paymentsFailed7d },
        ...(isFinance
          ? ([
              { href: "/admin/payouts", label: "Disbursements", icon: "payouts", badge: s.payoutsPending },
              { href: "/admin/finance", label: "Finance", icon: "wallet" },
            ] as NavGroup["items"])
          : []),
      ],
    },
    {
      title: "Platform",
      items: [
        ...(isOps
          ? ([
              { href: "/admin/coupons", label: "Promotions", icon: "ticket" },
              { href: "/admin/content", label: "Content", icon: "content" },
            ] as NavGroup["items"])
          : []),
        { href: "/admin/users", label: "Users", icon: "users" },
        ...(isSuper
          ? ([
              { href: "/admin/staff", label: "Staff", icon: "staff" },
              { href: "/admin/settings", label: "Settings", icon: "settings" },
            ] as NavGroup["items"])
          : []),
        { href: "/admin/audit", label: "Audit log", icon: "audit" },
      ],
    },
  ];

  return (
    <AdminSidebar
      groups={groups}
      panelLabel="Platform"
      accountName={admin.name ?? "Platform"}
      accentClass="bg-amber-600"
      accountMeta={admin.platformRole.replace(/_/g, " ")}
    />
  );
}

function SidebarSkeleton() {
  return (
    <div className="lg:w-60 shrink-0" aria-hidden="true">
      <div className="bg-white rounded-2xl border border-slate-200 h-[560px] animate-pulse" />
    </div>
  );
}
