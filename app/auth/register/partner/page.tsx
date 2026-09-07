import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { BedDouble, TrendingUp, Wallet } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { getSessionUser } from "@/lib/auth/guards";
import PartnerRegisterForm from "./PartnerRegisterForm";
import BecomePartnerForm from "./BecomePartnerForm";

export const metadata: Metadata = {
  title: "List your property · Tofiza",
  description:
    "Partner with Tofiza to list your hotel or resort, manage rates and availability, and take bookings across Bangladesh.",
};

const SELLING_POINTS = [
  { icon: BedDouble, text: "List unlimited rooms, set your own rates and availability" },
  { icon: TrendingUp, text: "Reach travellers searching across Bangladesh and beyond" },
  { icon: Wallet, text: "Track every booking and withdraw earnings from one dashboard" },
];

export default function PartnerRegisterPage() {
  return (
    <AuthShell
      tagline="Partner with Tofiza"
      title="List your property"
      subtitle="Create a partner account — it takes a minute, and approval usually lands within a working day."
      footer={
        <>
          Just want to book a trip?{" "}
          <Link href="/auth/register" className="text-brand-600 hover:text-brand-700 font-semibold">
            Create a traveller account
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-72 bg-slate-100 rounded-xl animate-pulse" />}>
        <Body />
      </Suspense>
    </AuthShell>
  );
}

async function Body() {
  const user = await getSessionUser();

  // Already a partner: skip straight to wherever they left off.
  if (user?.role === "vendor") {
    redirect(user.vendorStatus === "approved" ? "/vendor" : "/vendor/onboarding");
  }

  if (user?.role === "platform") {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold">You are signed in as platform staff</p>
        <p className="mt-0.5">
          Staff accounts cannot list properties. Sign out and use a separate account, or approve
          partners from{" "}
          <Link href="/admin/vendors" className="font-semibold underline">
            Admin → Vendors
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ul className="space-y-2">
        {SELLING_POINTS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2.5 text-sm text-slate-600">
            <Icon size={15} className="text-brand-600 shrink-0 mt-0.5" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-100 pt-5">
        {user ? (
          <BecomePartnerForm name={user.name ?? "Your account"} email={user.email ?? ""} />
        ) : (
          <PartnerRegisterForm />
        )}
      </div>

      {!user && (
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/auth/login?callbackUrl=/auth/register/partner"
            className="text-brand-600 hover:text-brand-700 font-semibold"
          >
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
