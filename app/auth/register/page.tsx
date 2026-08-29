import Link from "next/link";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create account · Tofiza",
  description: "Create a free Tofiza account to book flights and hotels across Bangladesh and beyond.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      tagline="Create your free travel account"
      title="Create account"
      subtitle="Join thousands of travellers who trust Tofiza"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="text-brand-600 hover:text-brand-700 font-semibold">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
