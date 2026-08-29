import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle, XCircle } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { verifyEmailAction } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Verify email · Tofiza",
  description: "Confirm your email address to finish setting up your Tofiza account.",
};

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <AuthShell tagline="Confirming your email address" title="Email verification">
      <Suspense fallback={<div className="h-32 bg-slate-50 rounded-xl animate-pulse" />}>
        <VerifyResult searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function VerifyResult({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const verified = await verifyEmailAction(token ?? "");

  return (
    <div className="text-center py-2">
      {verified ? (
        <>
          <CheckCircle size={44} className="text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-700 font-semibold mb-1">Email confirmed</p>
          <p className="text-slate-500 text-sm mb-6">
            Your address is verified. Booking vouchers will reach your inbox.
          </p>
        </>
      ) : (
        <>
          <XCircle size={44} className="text-red-500 mx-auto mb-4" />
          <p className="text-slate-700 font-semibold mb-1">This link is no longer valid</p>
          <p className="text-slate-500 text-sm mb-6">
            Verification links expire after 24 hours. Request a fresh one from your account.
          </p>
        </>
      )}
      <Link
        href="/account"
        className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl px-6 py-3 text-sm transition-colors"
      >
        Go to my account
      </Link>
    </div>
  );
}
