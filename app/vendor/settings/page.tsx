import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { PageHeader, Card } from "@/components/admin/Shell";
import { requireVendor } from "@/lib/auth/guards";
import { getVendor } from "@/lib/services/vendor-data";
import BankForm from "@/components/vendor/BankForm";

export default function VendorSettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Business profile and the account we pay out to." />
      <Suspense fallback={<div className="h-72 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <SettingsBody />
      </Suspense>
    </>
  );
}

async function SettingsBody() {
  const user = await requireVendor();
  const vendor = await getVendor(user.vendorId);
  if (!vendor) return null;

  const isOwner = user.vendorRole === "owner";

  return (
    <div className="space-y-5">
      <Card
        title="Business profile"
        action={
          <Link href="/vendor/onboarding" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            Edit
          </Link>
        }
      >
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {[
            ["Business name", vendor.businessName],
            ["Contact email", vendor.contactEmail],
            ["Contact phone", vendor.contactPhone],
            ["City", vendor.city],
            ["Trade licence", vendor.tradeLicenceNo || "—"],
            ["TIN", vendor.tin || "—"],
            [
              "Commission rate",
              vendor.commissionPct != null
                ? `${vendor.commissionPct}% (agreed rate)`
                : "Platform default",
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="font-medium text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card
        title="Payout account"
        description="Where approved disbursements are sent."
        action={
          vendor.bank.verified ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <ShieldCheck size={13} /> Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              <ShieldAlert size={13} /> Not verified
            </span>
          )
        }
      >
        {isOwner ? (
          <BankForm
            initial={{
              accountName: vendor.bank.accountName ?? "",
              accountNumber: vendor.bank.accountNumber ?? "",
              bankName: vendor.bank.bankName ?? "",
              branch: vendor.bank.branch ?? "",
              routingNumber: vendor.bank.routingNumber ?? "",
            }}
          />
        ) : (
          <p className="text-sm text-slate-500">
            Only the account owner can change payout details.
          </p>
        )}
      </Card>
    </div>
  );
}
