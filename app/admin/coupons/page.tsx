import { Suspense } from "react";
import { PageHeader } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { listCoupons } from "@/lib/services/coupon-data";
import CouponManager from "@/components/admin/CouponManager";
import { createPlatformCouponAction } from "@/lib/actions/coupon";

export default function AdminCouponsPage() {
  return (
    <>
      <PageHeader title="Promotions" subtitle="Platform-wide codes. Tofiza bears the cost of these." />
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body />
      </Suspense>
    </>
  );
}

async function Body() {
  await requirePlatform(["super_admin", "ops"]);
  const coupons = await listCoupons("platform");

  const { today, inAMonth } = dateDefaults();

  return (
    <CouponManager
      coupons={coupons}
      today={today}
      inAMonth={inAMonth}
      action={createPlatformCouponAction}
      costNote="Platform codes are funded by Tofiza — partners still receive their full earning."
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
