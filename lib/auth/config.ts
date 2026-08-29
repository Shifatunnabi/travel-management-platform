import type { NextAuthConfig } from "next-auth";

/**
 * Base config with no database or bcrypt imports, so `proxy.ts` can build a
 * lightweight NextAuth instance purely to read and verify the session cookie.
 * The full config in `lib/auth/index.ts` extends this with the provider.
 */
export const authConfig = {
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.platformRole = user.platformRole;
        token.vendorId = user.vendorId;
        token.vendorRole = user.vendorRole;
        token.vendorStatus = user.vendorStatus;
        token.isEmailVerified = user.isEmailVerified;
      }
      // `update()` from the client after e.g. finishing vendor onboarding.
      if (trigger === "update" && session) {
        Object.assign(token, session);
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.platformRole = token.platformRole;
        session.user.vendorId = token.vendorId;
        session.user.vendorRole = token.vendorRole;
        session.user.vendorStatus = token.vendorStatus;
        session.user.isEmailVerified = token.isEmailVerified;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
