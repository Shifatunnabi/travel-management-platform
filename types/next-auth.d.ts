import type { PlatformRole, UserRole, VendorMemberRole } from "@/lib/models/types";

/**
 * `emailVerified` is deliberately avoided as a field name — Auth.js already
 * declares it as a `Date` on AdapterUser, and redeclaring it as a boolean
 * produces an unusable `Date & boolean` intersection.
 */
interface TofizaClaims {
  id: string;
  role: UserRole;
  platformRole?: PlatformRole;
  vendorId?: string;
  vendorRole?: VendorMemberRole;
  vendorStatus?: string;
  isEmailVerified: boolean;
}

declare module "next-auth" {
  interface Session {
    user: TofizaClaims & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User extends Partial<TofizaClaims> {
    role: UserRole;
    isEmailVerified: boolean;
  }
}

// `next-auth/jwt` only re-exports this module, so the augmentation has to land
// on the original for the JWT interface to actually widen.
declare module "@auth/core/jwt" {
  interface JWT extends TofizaClaims {
    /** Present so the interface declares a member of its own. */
    sub?: string;
  }
}

export {};
