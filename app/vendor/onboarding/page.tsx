import { Suspense } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { PageHeader, Card } from "@/components/admin/Shell";
import { getSessionUser } from "@/lib/auth/guards";
import { getVendor } from "@/lib/services/vendor-data";
import OnboardingForm from "@/components/vendor/OnboardingForm";

export default function OnboardingPage() {
  return (
    <>
      <PageHeader
        title="Become a Tofiza partner"
        subtitle="Tell us about your business. You can start drafting properties straight away."
      />
      <Suspense fallback={<div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <OnboardingBody />
      </Suspense>
    </>
  );
}

async function OnboardingBody() {
  const user = await getSessionUser();
  const vendor = user?.vendorId ? await getVendor(user.vendorId) : null;

  return (
    <div className="space-y-5">
      {vendor && <StatusBanner status={vendor.status} note={vendor.moderation?.note} />}
      <OnboardingForm
        vendorId={vendor ? String(vendor._id) : user?.id ?? "new"}
        initial={
          vendor
            ? {
                businessName: vendor.businessName,
                contactEmail: vendor.contactEmail,
                contactPhone: vendor.contactPhone,
                address: vendor.address,
                city: vendor.city,
                tradeLicenceNo: vendor.tradeLicenceNo,
                tin: vendor.tin,
                kycDocuments: vendor.kycDocuments.map((d) => ({
                  label: d.label, publicId: d.publicId, url: d.url,
                })),
              }
            : undefined
        }
      />
    </div>
  );
}

function StatusBanner({ status, note }: { status: string; note?: string }) {
  if (status === "approved") {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <div className="flex gap-3">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-900">Your partner account is approved</p>
            <p className="text-sm text-emerald-800 mt-0.5">
              You can publish properties and take bookings. Edits below update your business
              profile without affecting your listings.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (status === "rejected") {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <div className="flex gap-3">
          <XCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-900">We could not approve your application</p>
            {note && <p className="text-sm text-rose-800 mt-0.5">{note}</p>}
            <p className="text-sm text-rose-800 mt-1">
              Update the details below and submit again.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (status === "suspended") {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <div className="flex gap-3">
          <XCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-900">Your account is suspended</p>
            <p className="text-sm text-rose-800 mt-0.5">
              {note ?? "Contact support to resolve this."} Existing bookings are unaffected.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <div className="flex gap-3">
        <Clock size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900">Application under review</p>
          <p className="text-sm text-amber-800 mt-0.5">
            We usually respond within one working day. You can draft properties and rooms while you
            wait — they just cannot go live yet.
          </p>
        </div>
      </div>
    </Card>
  );
}
