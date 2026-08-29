"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, Bookmark, User, LogOut, ChevronRight,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

const navItems = [
  { href: "/account", icon: LayoutDashboard, label: "Overview" },
  { href: "/account/bookings", icon: Bookmark, label: "My Bookings" },
  { href: "/account/profile", icon: User, label: "Profile" },
];

export default function DashboardSidebar({
  name,
  email,
  avatar,
}: {
  name: string;
  email: string;
  avatar?: string | null;
}) {
  const pathname = usePathname();
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="lg:w-64 shrink-0">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:sticky lg:top-24">
        {/* User info */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
          {avatar ? (
            <Image
              src={avatar}
              alt=""
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-slate-900 truncate">{name}</p>
            <p className="text-slate-500 text-xs truncate">{email}</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={17} className={active ? "text-brand-600" : "text-slate-400"} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} className="text-brand-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={17} className="text-slate-400" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
