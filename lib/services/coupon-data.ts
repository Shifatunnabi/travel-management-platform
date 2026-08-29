import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/lib/models/Coupon";
import type { CouponRow } from "@/components/admin/CouponManager";

export async function listCoupons(scope: "platform" | "vendor", vendorId?: string): Promise<CouponRow[]> {
  await connectDB();
  const query = scope === "vendor" ? { scope, vendorId } : { scope };
  const coupons = await Coupon.find(query).sort({ createdAt: -1 }).limit(100).lean();

  return coupons.map((c) => ({
    id: String(c._id),
    code: c.code,
    description: c.description,
    type: c.type,
    value: c.value,
    minSpend: c.minSpend,
    maxDiscount: c.maxDiscount ?? null,
    usageLimit: c.usageLimit ?? null,
    usedCount: c.usedCount,
    validFrom: c.validFrom.toISOString(),
    validTo: c.validTo.toISOString(),
    status: c.status,
    scope: c.scope,
  }));
}
