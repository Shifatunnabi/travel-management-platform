import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/config";

// A provider-free instance: this only needs to read and verify the session
// cookie, so it pulls in neither Mongoose nor bcrypt.
const { auth } = NextAuth(authConfig);

const VENDOR_PREFIX = "/vendor";
const ADMIN_PREFIX = "/admin";
const ACCOUNT_PREFIX = "/account";

export default auth((req) => {
  const { nextUrl } = req;
  const user = req.auth?.user;
  const path = nextUrl.pathname;

  const isVendorArea = path === VENDOR_PREFIX || path.startsWith(`${VENDOR_PREFIX}/`);
  const isAdminArea = path === ADMIN_PREFIX || path.startsWith(`${ADMIN_PREFIX}/`);
  const isAccountArea = path === ACCOUNT_PREFIX || path.startsWith(`${ACCOUNT_PREFIX}/`);

  if (!isVendorArea && !isAdminArea && !isAccountArea) {
    return NextResponse.next();
  }

  if (!user) {
    const login = new URL("/auth/login", nextUrl);
    login.searchParams.set("callbackUrl", path + nextUrl.search);
    return NextResponse.redirect(login);
  }

  if (isAdminArea && user.role !== "platform") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (isVendorArea && user.role !== "vendor") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // A vendor whose application is still pending can only reach onboarding.
  if (
    isVendorArea &&
    user.vendorStatus !== "approved" &&
    !path.startsWith(`${VENDOR_PREFIX}/onboarding`)
  ) {
    return NextResponse.redirect(new URL("/vendor/onboarding", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/vendor/:path*", "/admin/:path*", "/account/:path*"],
};
