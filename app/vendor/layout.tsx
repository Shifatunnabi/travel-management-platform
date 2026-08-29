import { Suspense } from "react";
import AdminSidebar, { type NavGroup, type NavItem } from "@/components/admin/AdminSidebar";
import { requireVendor } from "@/lib/auth/guards";
import { getVendor, getVendorSummary } from "@/lib/services/vendor-data";


export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Suspense fallback={<SidebarSkeleton />}>
            <VendorNav />
          </Suspense>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

async function VendorNav() {
  const user = await requireVendor();
  const [vendor, summary] = await Promise.all([
    getVendor(user.vendorId),
    getVendorSummary(user.vendorId),
  ]);

  const groups: NavGroup[] = [
    {
      items: [
        { href: "/vendor", label: "Dashboard", icon: "dashboard", exact: true },
      ],
    },
    {
      title: "Inventory",
      items: [
        { href: "/vendor/hotels", label: "Properties", icon: "building" },
        { href: "/vendor/calendar", label: "Rates & availability", icon: "calendar" },
      ],
    },
    {
      title: "Operations",
      items: [
        { href: "/vendor/bookings", label: "Bookings", icon: "bookings", badge: summary.arrivalsToday },
        { href: "/vendor/reviews", label: "Reviews", icon: "star", badge: summary.unansweredReviews },
      ],
    },
    {
      title: "Business",
      items: [
        { href: "/vendor/finance", label: "Finance", icon: "wallet" },
        { href: "/vendor/coupons", label: "Promotions", icon: "ticket" },
        ...(user.vendorRole === "owner"
          ? ([{ href: "/vendor/team", label: "Team", icon: "users" }] as NavItem[])
          : []),
        { href: "/vendor/settings", label: "Settings", icon: "settings" },
      ],
    },
  ];

  return (
    <AdminSidebar
      groups={groups}
      panelLabel="Partner"
      accountName={vendor?.businessName ?? "Partner"}
      accountMeta={`${user.name ?? ""} · ${user.vendorRole}`}
      accentClass="bg-teal-600"
    />
  );
}

function SidebarSkeleton() {
  return (
    <div className="lg:w-60 shrink-0" aria-hidden="true">
      <div className="bg-white rounded-2xl border border-slate-200 h-[520px] animate-pulse" />
    </div>
  );
}
