import Link from "next/link";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { getSessionUser, homePathFor } from "@/lib/auth/guards";
import { logoutAction } from "@/lib/actions/auth";
import Button from "@/components/ui/Button";

/**
 * The signed-in control in the navbar. Reads the session, so it lives behind
 * its own Suspense boundary — the rest of the navbar and the page around it
 * stay in the static shell.
 */
export default async function AccountMenu({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const user = await getSessionUser();
  if (!user) return <AuthButtons variant={variant} />;

  const home = homePathFor(user);
  const label =
    user.role === "vendor" ? "Partner panel" : user.role === "platform" ? "Admin panel" : "My account";
  const initial = (user.name ?? "?").trim().charAt(0).toUpperCase();

  if (variant === "mobile") {
    return (
      <>
        <Link href={home} className="block">
          <Button variant="outline" fullWidth size="md">
            <LayoutDashboard size={16} />
            {label}
          </Button>
        </Link>
        <form action={logoutAction}>
          <Button type="submit" variant="primary" fullWidth size="md">
            <LogOut size={16} />
            Sign out
          </Button>
        </form>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <Link
        href={home}
        className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors group"
        title={label}
      >
        <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {initial}
        </span>
        <span className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 max-w-28 truncate">
          {(user.name ?? "Account").split(" ")[0]}
        </span>
      </Link>
      <form action={logoutAction}>
        <button
          type="submit"
          title="Sign out"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut size={16} />
        </button>
      </form>
    </div>
  );
}

/** Shown while the session resolves, and to anyone signed out. */
export function AuthButtons({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  if (variant === "mobile") {
    return (
      <>
        <Link href="/auth/login" className="block">
          <Button variant="outline" fullWidth size="md">
            <User size={16} />
            Sign In
          </Button>
        </Link>
        <Link href="/auth/register" className="block">
          <Button variant="primary" fullWidth size="md">
            Create Account
          </Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/auth/login">
        <Button variant="secondary" size="sm">
          <User size={15} />
          Sign In
        </Button>
      </Link>
      <Link href="/auth/register">
        <Button size="sm" variant="primary">
          Get Started
        </Button>
      </Link>
    </>
  );
}
