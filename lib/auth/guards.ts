import { forbidden, unauthorized } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "./index";
import type { PlatformRole, VendorMemberRole } from "@/lib/models/types";

export type SessionUser = Session["user"];

/** Session or null. Reads cookies, so callers must be dynamic. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  return session?.user ?? null;
}

/** Any signed-in user. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) unauthorized();
  return user;
}

/**
 * A vendor member with an approved vendor. Returns `vendorId` as a plain
 * string so every downstream query can scope on it — this is the single
 * chokepoint that stops one vendor reading another's data.
 */
export async function requireVendor(
  allowed: VendorMemberRole[] = ["owner", "manager", "staff"],
): Promise<SessionUser & { vendorId: string; vendorRole: VendorMemberRole }> {
  const user = await requireUser();
  if (user.role !== "vendor" || !user.vendorId) forbidden();
  if (!user.vendorRole || !allowed.includes(user.vendorRole)) forbidden();
  return user as SessionUser & { vendorId: string; vendorRole: VendorMemberRole };
}

/** A platform staff member, optionally narrowed to specific sub-roles. */
export async function requirePlatform(
  allowed: PlatformRole[] = ["super_admin", "ops", "finance", "support"],
): Promise<SessionUser & { platformRole: PlatformRole }> {
  const user = await requireUser();
  if (user.role !== "platform" || !user.platformRole) forbidden();
  if (!allowed.includes(user.platformRole)) forbidden();
  return user as SessionUser & { platformRole: PlatformRole };
}

/** Non-throwing permission check, for conditionally rendering controls. */
export function canPlatform(
  user: SessionUser | null,
  allowed: PlatformRole[],
): boolean {
  return Boolean(
    user?.role === "platform" && user.platformRole && allowed.includes(user.platformRole),
  );
}

export function canVendor(
  user: SessionUser | null,
  allowed: VendorMemberRole[],
): boolean {
  return Boolean(
    user?.role === "vendor" && user.vendorRole && allowed.includes(user.vendorRole),
  );
}

/** Where a user belongs after signing in. */
export function homePathFor(user: SessionUser | null): string {
  if (!user) return "/";
  if (user.role === "platform") return "/admin";
  if (user.role === "vendor") {
    return user.vendorStatus === "approved" ? "/vendor" : "/vendor/onboarding";
  }
  return "/account";
}
