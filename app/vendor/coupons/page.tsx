import { Suspense } from "react";
import { PageHeader } from "@/components/admin/Shell";
import { requireVendor } from "@/lib/auth/guards";
import { listCoupons } from "@/lib/services/coupon-data";
import CouponManager from "@/components/admin/CouponManager";
import { createVendorCouponAction } from "@/lib/actions/coupon";

export default function VendorCouponsPage() {
  return (
    <>
      <PageHeader title="Promotions" subtitle="Discount codes for your own properties." />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body />
      </Suspense>
    </>
  );
}

async function Body() {
  const user = await requireVendor(["owner", "manager"]);
  const coupons = await listCoupons("vendor", user.vendorId);

  const { today, inAMonth } = dateDefaults();

  return (
    <CouponManager
      coupons={coupons}
      today={today}
      inAMonth={inAMonth}
      action={createVendorCouponAction}
      costNote="The discount comes out of your earnings, not the platform commission."
    />
  );
}

/** Server-side so the client form renders deterministically. */
function dateDefaults() {
  const now = Date.now();
  return {
    today: new Date(now).toISOString().slice(0, 10),
    inAMonth: new Date(now + 30 * 86_400_000).toISOString().slice(0, 10),
  };
}
