"use server";

import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import { requirePlatform } from "@/lib/auth/guards";
import { Hotel, deriveDisplayRating } from "@/lib/models/Hotel";
import { Review } from "@/lib/models/Review";
import { Vendor } from "@/lib/models/Vendor";
import { User } from "@/lib/models/User";
import { Settings } from "@/lib/models/Settings";
import { tags } from "@/lib/cache/tags";
import { audit } from "@/lib/services/audit";
import { readSettings } from "@/lib/services/settings";
import { sendMail } from "@/lib/services/mailer";
import { vendorStatusTemplate } from "@/lib/services/email-templates";
import {
  hotelModerationSchema,
  ratingAdjustmentSchema,
  reviewModerationSchema,
  settingsSchema,
  staffSchema,
  vendorDecisionSchema,
} from "@/lib/validation/admin";
import { fail, parseForm, succeed, type ActionState } from "./_result";

// ─── Vendors ─────────────────────────────────────────────────────────────────

export async function decideVendorAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePlatform(["super_admin", "ops"]);
  const parsed = parseForm(vendorDecisionSchema, formData);
  if (!parsed.ok) return parsed.state;

  const { vendorId, decision, note, commissionPct } = parsed.data;
  if (decision === "reject" && !note?.trim()) {
    return fail("Give a reason so the partner knows what to fix.", {
      note: ["A reason is required when rejecting."],
    });
  }

  await connectDB();
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) return fail("That vendor does not exist.");

  const before = { status: vendor.status, commissionPct: vendor.commissionPct };
  const nextStatus = {
    approve: "approved",
    reject: "rejected",
    suspend: "suspended",
    reinstate: "approved",
  }[decision] as typeof vendor.status;

  vendor.status = nextStatus;
  vendor.moderation = { reviewedBy: admin.id as never, note, at: new Date() };
  if (commissionPct !== null) vendor.commissionPct = commissionPct;
  if (decision === "approve") vendor.bank.verified = Boolean(vendor.bank.accountNumber);
  await vendor.save();

  // Suspending pulls the vendor's live listings out of search immediately;
  // existing bookings are deliberately left alone.
  if (decision === "suspend") {
    const affected = await Hotel.find({ vendorId, status: "published" }).select("_id city");
    await Hotel.updateMany({ vendorId, status: "published" }, { $set: { status: "suspended" } });
    for (const h of affected) {
      updateTag(tags.hotel(String(h._id)));
      updateTag(tags.hotelsByCity(h.city));
    }
  }

  await audit({
    actor: admin, action: `vendor.${decision}`, entity: "Vendor",
    entityId: vendorId, before, after: { status: nextStatus, commissionPct: vendor.commissionPct },
    reason: note,
  });

  if (decision === "approve" || decision === "reject") {
    const mail = vendorStatusTemplate(vendor.businessName, decision === "approve", note);
    void sendMail({
      to: vendor.contactEmail, subject: mail.subject, html: mail.html,
      template: "vendor-status", relatedTo: { entity: "Vendor", id: vendorId },
    });
  }

  updateTag(tags.hotels());
  revalidatePath("/admin/vendors");
  return succeed(
    {
      approve: "Vendor approved. They can publish properties now.",
      reject: "Vendor rejected and notified.",
      suspend: "Vendor suspended and their listings pulled from search.",
      reinstate: "Vendor reinstated.",
    }[decision],
  );
}

export async function verifyVendorBankAction(vendorId: string): Promise<ActionState> {
  const admin = await requirePlatform(["super_admin", "finance"]);
  await connectDB();
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) return fail("That vendor does not exist.");
  if (!vendor.bank.accountNumber) return fail("No bank account on file to verify.");

  vendor.bank.verified = true;
  vendor.bank.verifiedAt = new Date();
  await vendor.save();

  await audit({ actor: admin, action: "vendor.bank.verify", entity: "Vendor", entityId: vendorId });
  revalidatePath(`/admin/vendors/${vendorId}`);
  return succeed("Bank account verified. Payouts can be released.");
}

// ─── Hotel moderation ────────────────────────────────────────────────────────

export async function moderateHotelAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePlatform(["super_admin", "ops"]);
  const parsed = parseForm(hotelModerationSchema, formData);
  if (!parsed.ok) return parsed.state;

  const { hotelId, decision, note } = parsed.data;
  if (decision !== "approve" && !note?.trim()) {
    return fail("Give a reason so the partner knows what to change.", {
      note: ["A reason is required."],
    });
  }

  await connectDB();
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) return fail("That property does not exist.");

  const before = { status: hotel.status, hadRevision: Boolean(hotel.pendingRevision) };

  if (decision === "approve") {
    // Approving a queued edit applies it; approving a new listing publishes it.
    if (hotel.pendingRevision) {
      hotel.set(hotel.pendingRevision);
      hotel.pendingRevision = null;
    }
    hotel.status = "published";
  } else {
    hotel.status = decision === "reject" ? "rejected" : "suspended";
    hotel.pendingRevision = null;
  }
  hotel.moderation = { reviewedBy: admin.id as never, note, at: new Date() };
  await hotel.save();

  await audit({
    actor: admin, action: `hotel.${decision}`, entity: "Hotel", entityId: hotelId,
    before, after: { status: hotel.status }, reason: note,
  });

  updateTag(tags.hotel(hotelId));
  updateTag(tags.hotelsByCity(hotel.city));
  updateTag(tags.hotels());
  revalidatePath("/admin/hotels");
  return succeed(
    {
      approve: "Property is live.",
      reject: "Property rejected and the partner notified.",
      suspend: "Property suspended and removed from search.",
    }[decision],
  );
}

export async function setHotelFeatureAction(
  hotelId: string,
  featured: boolean,
): Promise<ActionState> {
  const admin = await requirePlatform(["super_admin", "ops"]);
  await connectDB();
  const hotel = await Hotel.findByIdAndUpdate(hotelId, { $set: { featured } }, { new: true });
  if (!hotel) return fail("That property does not exist.");

  await audit({ actor: admin, action: featured ? "hotel.feature" : "hotel.unfeature", entity: "Hotel", entityId: hotelId });
  updateTag(tags.hotel(hotelId));
  updateTag(tags.home());
  revalidatePath("/admin/hotels");
  return succeed(featured ? "Featured on the homepage." : "Removed from the homepage.");
}

// ─── Ratings ─────────────────────────────────────────────────────────────────

/**
 * Super admin only. The true average in `reviewStats` is never touched — only
 * the adjustment and the two derived display fields change, so any adjustment
 * is fully reversible and the real number stays auditable.
 */
export async function adjustRatingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePlatform(["super_admin"]);
  const parsed = parseForm(ratingAdjustmentSchema, formData);
  if (!parsed.ok) return parsed.state;

  const { hotelId, mode, value, seedCount, reason } = parsed.data;
  await connectDB();

  const settings = await readSettings();
  if (mode === "offset" && Math.abs(value) > settings.maxRatingOffset) {
    return fail(
      `Offsets are capped at ±${settings.maxRatingOffset.toFixed(1)} by platform settings.`,
      { value: [`Keep this between -${settings.maxRatingOffset} and ${settings.maxRatingOffset}.`] },
    );
  }

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) return fail("That property does not exist.");

  const before = {
    adjustment: { ...hotel.ratingAdjustment },
    displayRating: hotel.displayRating,
    displayReviewCount: hotel.displayReviewCount,
    trueAverage: hotel.reviewStats.avg,
    trueCount: hotel.reviewStats.count,
  };

  hotel.ratingAdjustment = {
    mode,
    value: mode === "none" ? 0 : value,
    seedCount: mode === "none" ? 0 : seedCount,
    reason: mode === "none" ? undefined : reason,
    setBy: admin.id as never,
    setAt: new Date(),
  };
  Object.assign(hotel, deriveDisplayRating(hotel));
  await hotel.save();

  await audit({
    actor: admin, action: "hotel.rating.adjust", entity: "Hotel", entityId: hotelId,
    before,
    after: {
      adjustment: hotel.ratingAdjustment,
      displayRating: hotel.displayRating,
      displayReviewCount: hotel.displayReviewCount,
      trueAverage: hotel.reviewStats.avg,
    },
    reason,
  });

  updateTag(tags.hotel(hotelId));
  updateTag(tags.hotelsByCity(hotel.city));
  revalidatePath(`/admin/hotels/${hotelId}/rating`);
  return succeed(
    mode === "none"
      ? `Adjustment cleared. Showing the true average of ${hotel.reviewStats.avg.toFixed(1)}.`
      : `Now displaying ${hotel.displayRating.toFixed(1)} from ${hotel.displayReviewCount} reviews (true average ${hotel.reviewStats.avg.toFixed(1)} from ${hotel.reviewStats.count}).`,
  );
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function moderateReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePlatform(["super_admin", "ops", "support"]);
  const parsed = parseForm(reviewModerationSchema, formData);
  if (!parsed.ok) return parsed.state;

  const { reviewId, decision, reason } = parsed.data;
  if (decision !== "publish" && !reason?.trim()) {
    return fail("Give a reason — the reviewer can see it.", { reason: ["A reason is required."] });
  }

  await connectDB();
  const review = await Review.findById(reviewId);
  if (!review) return fail("That review does not exist.");

  const before = review.status;
  review.status = decision === "publish" ? "published" : decision === "reject" ? "rejected" : "hidden";
  review.moderation = { by: admin.id as never, reason, at: new Date() };
  review.reported = null;
  await review.save();

  await recomputeHotelRating(String(review.hotelId));

  await audit({
    actor: admin, action: `review.${decision}`, entity: "Review", entityId: reviewId,
    before: { status: before }, after: { status: review.status }, reason,
  });

  updateTag(tags.reviews(String(review.hotelId)));
  updateTag(tags.hotel(String(review.hotelId)));
  revalidatePath("/admin/reviews");
  return succeed(
    { publish: "Review published.", reject: "Review rejected.", hide: "Review hidden." }[decision],
  );
}

/**
 * Recomputes a hotel's true review statistics and re-derives what is displayed.
 * Called wherever a review changes moderation state.
 */
export async function recomputeHotelRating(hotelId: string): Promise<void> {
  await connectDB();
  const [stats] = await Review.aggregate<{ count: number; sum: number }>([
    { $match: { hotelId: (await import("mongoose")).Types.ObjectId.createFromHexString(hotelId), status: "published" } },
    { $group: { _id: null, count: { $sum: 1 }, sum: { $sum: "$rating" } } },
  ]);

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) return;

  const count = stats?.count ?? 0;
  const sum = stats?.sum ?? 0;
  hotel.reviewStats = { count, sum, avg: count ? Math.round((sum / count) * 100) / 100 : 0 };
  Object.assign(hotel, deriveDisplayRating(hotel));
  await hotel.save();
}

// ─── Settings & staff ────────────────────────────────────────────────────────

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePlatform(["super_admin"]);
  const parsed = parseForm(settingsSchema, formData);
  if (!parsed.ok) return parsed.state;

  await connectDB();
  const before = await readSettings();
  await Settings.updateOne({ key: "global" }, { $set: parsed.data }, { upsert: true });

  await audit({
    actor: admin, action: "settings.update", entity: "Settings", entityId: "global",
    before, after: parsed.data,
  });

  revalidateTag(tags.settings(), "max");
  revalidatePath("/admin/settings");
  return succeed("Settings saved.");
}

export async function createStaffAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePlatform(["super_admin"]);
  const parsed = parseForm(staffSchema, formData);
  if (!parsed.ok) return parsed.state;

  await connectDB();
  const exists = await User.findOne({ email: parsed.data.email.toLowerCase() }).select("_id").lean();
  if (exists) return fail("Someone already uses that email.", { email: ["Email already in use."] });

  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    passwordHash: await bcrypt.hash(parsed.data.password, 12),
    role: "platform",
    platformRole: parsed.data.platformRole,
    emailVerifiedAt: new Date(),
  });

  await audit({
    actor: admin, action: "staff.create", entity: "User", entityId: String(user._id),
    after: { email: user.email, platformRole: user.platformRole },
  });

  revalidatePath("/admin/staff");
  return succeed(`${parsed.data.name} can now sign in as ${parsed.data.platformRole.replace("_", " ")}.`);
}

export async function setUserStatusAction(
  userId: string,
  suspended: boolean,
): Promise<ActionState> {
  const admin = await requirePlatform(["super_admin", "ops"]);
  if (userId === admin.id) return fail("You cannot suspend your own account.");

  await connectDB();
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { status: suspended ? "suspended" : "active" } },
    { new: true },
  );
  if (!user) return fail("That account does not exist.");

  await audit({
    actor: admin, action: suspended ? "user.suspend" : "user.reinstate",
    entity: "User", entityId: userId,
  });
  revalidatePath("/admin/users");
  return succeed(suspended ? "Account suspended." : "Account reinstated.");
}
