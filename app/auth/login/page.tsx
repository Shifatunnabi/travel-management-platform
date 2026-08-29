import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in · Tofiza",
  description: "Sign in to manage your flight and hotel bookings with Tofiza.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  return (
    <AuthShell
      tagline="Sign in to your travel account"
      title="Welcome back"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-brand-600 hover:text-brand-700 font-semibold">
            Sign up free
          </Link>
        </>
      }
    >
      <Suspense fallback={<FormSkeleton rows={2} />}>
        <LoginFormLoader searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function LoginFormLoader({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  // Only same-origin paths, so a crafted ?callbackUrl= cannot bounce a freshly
  // signed-in user to another site.
  const safe = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
    ? callbackUrl
    : undefined;
  return <LoginForm callbackUrl={safe} />;
}

export function FormSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i}>
          <div className="h-3 w-24 bg-slate-200 rounded mb-2 animate-pulse" />
          <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ))}
      <div className="h-12 bg-slate-200 rounded-xl animate-pulse mt-2" />
    </div>
  );
}
