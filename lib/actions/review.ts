"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { requireUser, requireVendor } from "@/lib/auth/guards";
import { Booking } from "@/lib/models/Booking";
import { Review } from "@/lib/models/Review";
import { tags } from "@/lib/cache/tags";
import { audit } from "@/lib/services/audit";
import { reviewSchema, vendorReplySchema } from "@/lib/validation/booking";
import { fail, parseForm, succeed, type ActionState } from "./_result";

/**
 * A review can only come from a completed stay, and `bookingId` is unique on
 * the collection — one stay, one review, so ratings cannot be farmed.
 */
export async function submitReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseForm(reviewSchema, formData);
  if (!parsed.ok) return parsed.state;

  const user = await requireUser();
  await connectDB();

  const booking = await Booking.findOne({
    ref: parsed.data.ref.toUpperCase(),
    customerId: user.id,
  });
  if (!booking) return fail("We could not find that booking.");
  if (booking.status !== "completed") {
    return fail("You can review a stay once it is complete.");
  }

  const existing = await Review.findOne({ bookingId: booking._id }).select("_id").lean();
  if (existing) return fail("You have already reviewed this stay.");

  await Review.create({
    hotelId: booking.hotelId,
    vendorId: booking.vendorId,
    bookingId: booking._id,
    customerId: user.id,
    authorName: user.name ?? booking.guestDetails.fullName ?? "Guest",
    rating: parsed.data.rating,
    title: parsed.data.title,
    body: parsed.data.body,
    tripType: parsed.data.tripType,
    status: "pending",
  });

  booking.reviewedAt = new Date();
  await booking.save();

  revalidatePath("/account/bookings");
  return succeed("Thank you. Your review will appear once it has been checked.");
}

export async function replyToReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseForm(vendorReplySchema, formData);
  if (!parsed.ok) return parsed.state;

  const user = await requireVendor(["owner", "manager"]);
  await connectDB();

  const review = await Review.findOne({
    _id: parsed.data.reviewId,
    vendorId: user.vendorId,
    status: "published",
  });
  if (!review) return fail("That review does not exist.");
  if (review.vendorReply) return fail("You have already replied to this review.");

  review.vendorReply = { body: parsed.data.body, at: new Date(), by: user.id as never };
  await review.save();

  await audit({
    actor: user, action: "review.reply", entity: "Review", entityId: String(review._id),
  });

  revalidateTag(tags.reviews(String(review.hotelId)), "max");
  revalidatePath("/vendor/reviews");
  return succeed("Reply published.");
}

export async function reportReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const reviewId = String(formData.get("reviewId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 5) return fail("Tell us what is wrong with it.", { reason: ["Give a reason."] });

  const user = await requireVendor(["owner", "manager"]);
  await connectDB();

  const review = await Review.findOne({ _id: reviewId, vendorId: user.vendorId });
  if (!review) return fail("That review does not exist.");
  if (review.reported) return fail("This review is already with the platform team.");

  review.reported = { by: user.id as never, reason, at: new Date() };
  await review.save();

  await audit({
    actor: user, action: "review.report", entity: "Review",
    entityId: String(review._id), reason,
  });

  revalidatePath("/vendor/reviews");
  return succeed("Reported. The platform team will look at it.");
}
