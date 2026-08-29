import Link from "next/link";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password · Tofiza",
  description: "Request a link to reset your Tofiza account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      tagline="We will email you a reset link"
      title="Forgot password"
      subtitle="Enter the address you signed up with"
      footer={
        <Link href="/auth/login" className="text-brand-600 hover:text-brand-700 font-semibold">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
