"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { requirePlatform, requireVendor, type SessionUser } from "@/lib/auth/guards";
import { Coupon } from "@/lib/models/Coupon";
import { audit } from "@/lib/services/audit";
import { couponSchema } from "@/lib/validation/admin";
import { fail, parseForm, succeed, type ActionState } from "./_result";

async function saveCoupon(
  actor: SessionUser,
  formData: FormData,
  scope: "platform" | "vendor",
  vendorId?: string,
): Promise<ActionState> {
  const parsed = parseForm(couponSchema, formData);
  if (!parsed.ok) return parsed.state;

  await connectDB();
  const d = parsed.data;

  const exists = await Coupon.findOne({ code: d.code }).select("_id").lean();
  if (exists) return fail("That code is already in use.", { code: ["Code already exists."] });

  const coupon = await Coupon.create({
    code: d.code,
    description: d.description,
    scope,
    vendorId: vendorId ?? null,
    type: d.type,
    value: d.value,
    maxDiscount: d.maxDiscount,
    minSpend: d.minSpend,
    usageLimit: d.usageLimit,
    perUserLimit: d.perUserLimit,
    validFrom: new Date(`${d.validFrom}T00:00:00.000Z`),
    validTo: new Date(`${d.validTo}T23:59:59.000Z`),
    appliesTo: { hotelIds: [], cities: [] },
    status: "active",
    createdBy: actor.id,
  });

  await audit({
    actor, action: "coupon.create", entity: "Coupon",
    entityId: String(coupon._id), after: { code: d.code, scope, value: d.value, type: d.type },
  });

  revalidatePath(scope === "vendor" ? "/vendor/coupons" : "/admin/coupons");
  return succeed(
    `${d.code} is live — ${d.type === "percent" ? `${d.value}% off` : `৳${d.value} off`}${
      d.minSpend ? ` on spends over ৳${d.minSpend.toLocaleString("en-BD")}` : ""
    }.`,
  );
}

export async function createVendorCouponAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireVendor(["owner", "manager"]);
  return saveCoupon(user, formData, "vendor", user.vendorId);
}

export async function createPlatformCouponAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePlatform(["super_admin", "ops"]);
  return saveCoupon(admin, formData, "platform");
}

export async function setCouponStatusAction(
  couponId: string,
  status: "active" | "paused",
): Promise<ActionState> {
  await connectDB();
  const coupon = await Coupon.findById(couponId);
  if (!coupon) return fail("That code does not exist.");

  // A vendor may only touch their own codes; platform staff may touch any.
  let actor: SessionUser;
  if (coupon.scope === "vendor") {
    const user = await requireVendor(["owner", "manager"]);
    if (String(coupon.vendorId) !== user.vendorId) return fail("That code is not yours.");
    actor = user;
  } else {
    actor = await requirePlatform(["super_admin", "ops"]);
  }

  coupon.status = status;
  await coupon.save();

  await audit({ actor, action: `coupon.${status}`, entity: "Coupon", entityId: couponId });
  revalidatePath(coupon.scope === "vendor" ? "/vendor/coupons" : "/admin/coupons");
  return succeed(status === "active" ? "Code reactivated." : "Code paused.");
}
