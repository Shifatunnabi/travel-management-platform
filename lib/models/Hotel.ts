import { Schema, model, models, type Model, type Types } from "mongoose";
import {
  HOTEL_STATUSES,
  PROPERTY_TYPES,
  RATING_ADJUSTMENT_MODES,
  type HotelStatus,
  type PropertyType,
  type RatingAdjustmentMode,
} from "./types";

export interface IImage {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface IHotel {
  _id: Types.ObjectId;
  vendorId: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  propertyType: PropertyType;
  /** The property's official class (a "5-star hotel"). Distinct from guest rating. */
  starCategory: number;
  address: string;
  city: string;
  country: string;
  location: string;
  geo?: { type: "Point"; coordinates: [number, number] };
  distanceFromCenter?: number;
  images: IImage[];
  amenities: string[];
  tags: string[];
  policies: {
    checkInTime: string;
    checkOutTime: string;
    cancellationHours: number;
    childrenAllowed: boolean;
    petsAllowed: boolean;
    extraNotes?: string;
  };
  status: HotelStatus;
  moderation: {
    reviewedBy?: Types.ObjectId | null;
    note?: string;
    at?: Date | null;
  };
  /** Set while a live hotel has edits awaiting approval. */
  pendingRevision?: Record<string, unknown> | null;

  /** Truth: computed from published reviews only. Never edited by hand. */
  reviewStats: { count: number; sum: number; avg: number };
  /** Platform-applied adjustment. Super admin only. */
  ratingAdjustment: {
    mode: RatingAdjustmentMode;
    value: number;
    seedCount: number;
    reason?: string;
    setBy?: Types.ObjectId | null;
    setAt?: Date | null;
  };
  /** Denormalized for sorting and listing. Derived from the two fields above. */
  displayRating: number;
  displayReviewCount: number;

  /** Denormalized cheapest room price, for search cards and sorting. */
  priceFrom: number;
  currency: string;
  featured: boolean;
  listingPriority: number;
  createdAt: Date;
  updatedAt: Date;
}

export const imageSchema = new Schema<IImage>(
  {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    width: Number,
    height: Number,
    alt: String,
  },
  { _id: false },
);

const hotelSchema = new Schema<IHotel>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    propertyType: { type: String, enum: PROPERTY_TYPES, default: "hotel" },
    starCategory: { type: Number, min: 1, max: 5, default: 3 },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    country: { type: String, default: "Bangladesh" },
    location: { type: String, required: true },
    geo: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] },
    },
    distanceFromCenter: Number,
    images: { type: [imageSchema], default: [] },
    amenities: { type: [String], default: [], index: true },
    tags: { type: [String], default: [] },
    policies: {
      checkInTime: { type: String, default: "14:00" },
      checkOutTime: { type: String, default: "12:00" },
      cancellationHours: { type: Number, default: 24 },
      childrenAllowed: { type: Boolean, default: true },
      petsAllowed: { type: Boolean, default: false },
      extraNotes: String,
    },
    status: { type: String, enum: HOTEL_STATUSES, default: "draft", index: true },
    moderation: {
      reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
      note: String,
      at: { type: Date, default: null },
    },
    pendingRevision: { type: Schema.Types.Mixed, default: null },

    reviewStats: {
      count: { type: Number, default: 0 },
      sum: { type: Number, default: 0 },
      avg: { type: Number, default: 0 },
    },
    ratingAdjustment: {
      mode: { type: String, enum: RATING_ADJUSTMENT_MODES, default: "none" },
      value: { type: Number, default: 0 },
      seedCount: { type: Number, default: 0, min: 0 },
      reason: String,
      setBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
      setAt: { type: Date, default: null },
    },
    displayRating: { type: Number, default: 0, index: true },
    displayReviewCount: { type: Number, default: 0 },

    priceFrom: { type: Number, default: 0, index: true },
    currency: { type: String, default: "BDT" },
    featured: { type: Boolean, default: false, index: true },
    listingPriority: { type: Number, default: 0 },
  },
  { timestamps: true },
);

hotelSchema.index({ city: 1, status: 1 });
hotelSchema.index({ status: 1, displayRating: -1 });
hotelSchema.index({ status: 1, priceFrom: 1 });
hotelSchema.index({ geo: "2dsphere" });
hotelSchema.index({ name: "text", description: "text", city: "text", location: "text" });

export const Hotel: Model<IHotel> =
  (models.Hotel as Model<IHotel>) ?? model<IHotel>("Hotel", hotelSchema);

/**
 * The single place the displayed rating is derived. Both the true average and
 * the adjustment survive; only the two `display*` fields are computed.
 */
export function deriveDisplayRating(hotel: {
  reviewStats: { count: number; avg: number };
  ratingAdjustment: { mode: RatingAdjustmentMode; value: number; seedCount: number };
}): { displayRating: number; displayReviewCount: number } {
  const { mode, value, seedCount } = hotel.ratingAdjustment;
  const real = hotel.reviewStats.avg;

  let rating = real;
  if (mode === "override") rating = value;
  else if (mode === "offset") rating = real === 0 ? value : real + value;

  return {
    displayRating: Math.round(Math.min(5, Math.max(0, rating)) * 10) / 10,
    displayReviewCount: hotel.reviewStats.count + (seedCount || 0),
  };
}
