import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Choose a new password · Tofiza",
  description: "Set a new password for your Tofiza account.",
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <AuthShell
      tagline="Choose a new password"
      title="Set new password"
      subtitle="Pick something you have not used before"
      footer={
        <Link href="/auth/login" className="text-brand-600 hover:text-brand-700 font-semibold">
          Back to sign in
        </Link>
      }
    >
      <Suspense fallback={<div className="h-40 bg-slate-50 rounded-xl animate-pulse" />}>
        <TokenGate searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function TokenGate({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        This link is missing its reset token. Request a new one from the{" "}
        <Link href="/auth/forgot-password" className="font-semibold underline">
          forgot password
        </Link>{" "}
        page.
      </div>
    );
  }
  return <ResetPasswordForm token={token} />;
}
