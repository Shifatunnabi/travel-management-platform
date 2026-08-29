import { Suspense } from "react";
import { PageHeader } from "@/components/admin/Shell";
import { requireVendor } from "@/lib/auth/guards";
import HotelForm from "@/components/vendor/HotelForm";

export default function NewHotelPage() {
  return (
    <>
      <PageHeader
        title="Add a property"
        subtitle="Save it as a draft, add rooms, then submit for review."
        breadcrumb={[{ label: "Properties", href: "/vendor/hotels" }, { label: "New" }]}
      />
      <Suspense fallback={<div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <NewHotelForm />
      </Suspense>
    </>
  );
}

async function NewHotelForm() {
  const user = await requireVendor(["owner", "manager"]);
  return <HotelForm vendorId={user.vendorId} />;
}
