import { Schema, model, models, type Model, type Types } from "mongoose";
import { REVIEW_STATUSES, type ReviewStatus } from "./types";

export interface IReview {
  _id: Types.ObjectId;
  hotelId: Types.ObjectId;
  vendorId: Types.ObjectId;
  /** Unique — one completed stay yields exactly one review. */
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  authorName: string;
  rating: number;
  title?: string;
  body: string;
  tripType?: string;
  status: ReviewStatus;
  vendorReply?: { body: string; at: Date; by: Types.ObjectId } | null;
  reported?: { by: Types.ObjectId; reason: string; at: Date } | null;
  moderation?: { by: Types.ObjectId; reason?: string; at: Date } | null;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    hotelId: { type: Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    body: { type: String, required: true },
    tripType: String,
    status: { type: String, enum: REVIEW_STATUSES, default: "pending", index: true },
    vendorReply: { type: Schema.Types.Mixed, default: null },
    reported: { type: Schema.Types.Mixed, default: null },
    moderation: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

reviewSchema.index({ hotelId: 1, status: 1, createdAt: -1 });

export const Review: Model<IReview> =
  (models.Review as Model<IReview>) ?? model<IReview>("Review", reviewSchema);
