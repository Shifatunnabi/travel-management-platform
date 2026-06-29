"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, Bookmark, User, Settings,
  Bell, LogOut, ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/bookings", icon: Bookmark, label: "My Bookings" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/dashboard/notifications", icon: Bell, label: "Notifications", badge: 3 },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="lg:w-64 shrink-0">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:sticky lg:top-24">
        {/* User info */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            F
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 truncate">Farhan Ahmed</p>
            <p className="text-slate-500 text-xs truncate">farhan@email.com</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="space-y-1">
          {navItems.map(({ href, icon: Icon, label, badge }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={17} className={active ? "text-blue-600" : "text-slate-400"} />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
                {active && <ChevronRight size={14} className="text-blue-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <Link
            href="/auth/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={17} className="text-slate-400" />
            Sign Out
          </Link>
        </div>
      </div>
    </div>
  );
}
