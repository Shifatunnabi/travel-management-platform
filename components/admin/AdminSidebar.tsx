"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, CalendarRange, BookMarked, Star, Wallet,
  Users, Settings, Ticket, ShieldCheck, Store, MessageSquareWarning,
  CreditCard, Banknote, FileClock, LayoutTemplate, UserCog, ScrollText,
  LogOut, type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

/**
 * Icons are addressed by name, not by component reference: a server component
 * cannot pass a function across the boundary into this client component.
 */
const ICONS = {
  dashboard: LayoutDashboard, building: Building2, calendar: CalendarRange,
  bookings: BookMarked, star: Star, wallet: Wallet, users: Users,
  settings: Settings, ticket: Ticket, shield: ShieldCheck, store: Store,
  reviews: MessageSquareWarning, payments: CreditCard, payouts: Banknote,
  audit: FileClock, content: LayoutTemplate, staff: UserCog, reports: ScrollText,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  badge?: number;
  exact?: boolean;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export default function AdminSidebar({
  groups,
  panelLabel,
  accountName,
  accountMeta,
  accentClass = "bg-brand-600",
}: {
  groups: NavGroup[];
  panelLabel: string;
  accountName: string;
  accountMeta: string;
  accentClass?: string;
}) {
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <aside className="lg:w-60 shrink-0">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:sticky lg:top-6">
        <Link href="/" className="flex items-center gap-2 px-1 pb-4 mb-3 border-b border-slate-100">
          <Image
            src="/asset/tofiza.png"
            alt="Tofiza"
            width={340}
            height={100}
            className="h-7 w-auto object-contain"
          />
          <span className={`text-[10px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded ${accentClass}`}>
            {panelLabel}
          </span>
        </Link>

        <nav className="space-y-4">
          {groups.map((group, gi) => (
            <div key={group.title ?? gi}>
              {group.title && (
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.title}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon, badge, exact }) => {
                  const Icon = ICONS[icon];
                  const active = isActive({ href, label, icon, exact });
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? "bg-brand-50 text-brand-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon size={16} className={active ? "text-brand-600" : "text-slate-400"} />
                      <span className="flex-1 truncate">{label}</span>
                      {badge != null && badge > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center tabular-nums">
                          {badge > 99 ? "99+" : badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="px-3 mb-2 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{accountName}</p>
            <p className="text-[11px] text-slate-400 truncate">{accountMeta}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <LogOut size={16} className="text-slate-400" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
