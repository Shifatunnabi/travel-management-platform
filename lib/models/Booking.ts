import { Schema, model, models, type Model, type Types } from "mongoose";
import { BOOKING_STATUSES, type BookingStatus } from "./types";

export interface IBookingTimelineEntry {
  status: BookingStatus;
  at: Date;
  by?: Types.ObjectId | null;
  note?: string;
}

export interface IBookingPricing {
  nightlyRates: { date: Date; price: number }[];
  roomTotal: number;
  taxes: number;
  serviceFee: number;
  discount: number;
  couponCode?: string | null;
  grandTotal: number;
  currency: string;
  /** Frozen at booking time — rate changes must not rewrite history. */
  commissionPct: number;
  commissionAmount: number;
  vendorEarning: number;
}

export interface IBooking {
  _id: Types.ObjectId;
  ref: string;
  customerId?: Types.ObjectId | null;
  hotelId: Types.ObjectId;
  vendorId: Types.ObjectId;
  roomId: Types.ObjectId;
  ratePlanCode: string;
  /** Snapshot so a renamed room or hotel does not rewrite an old voucher. */
  snapshot: {
    hotelName: string;
    hotelSlug: string;
    hotelCity: string;
    hotelAddress: string;
    hotelImage?: string;
    roomName: string;
    ratePlanName: string;
    breakfast: boolean;
    refundable: boolean;
    cancellationHours: number;
  };
  checkIn: Date;
  checkOut: Date;
  nights: number;
  units: number;
  guests: { adults: number; children: number };
  guestDetails: {
    fullName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  pricing: IBookingPricing;
  status: BookingStatus;
  paymentId?: Types.ObjectId | null;
  holdExpiresAt?: Date | null;
  cancellation?: {
    by: Types.ObjectId | null;
    byRole: string;
    reason: string;
    at: Date;
    refundAmount: number;
  } | null;
  reviewedAt?: Date | null;
  timeline: IBookingTimelineEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    ref: { type: String, required: true, unique: true, uppercase: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    hotelId: { type: Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    ratePlanCode: { type: String, required: true },
    snapshot: {
      hotelName: { type: String, required: true },
      hotelSlug: { type: String, required: true },
      hotelCity: { type: String, required: true },
      hotelAddress: { type: String, required: true },
      hotelImage: String,
      roomName: { type: String, required: true },
      ratePlanName: { type: String, required: true },
      breakfast: { type: Boolean, default: false },
      refundable: { type: Boolean, default: true },
      cancellationHours: { type: Number, default: 24 },
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },
    units: { type: Number, required: true, min: 1, default: 1 },
    guests: {
      adults: { type: Number, default: 2, min: 1 },
      children: { type: Number, default: 0, min: 0 },
    },
    guestDetails: {
      fullName: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      specialRequests: String,
    },
    pricing: {
      nightlyRates: [
        new Schema({ date: Date, price: Number }, { _id: false }),
      ],
      roomTotal: { type: Number, required: true },
      taxes: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      couponCode: { type: String, default: null },
      grandTotal: { type: Number, required: true },
      currency: { type: String, default: "BDT" },
      commissionPct: { type: Number, required: true },
      commissionAmount: { type: Number, required: true },
      vendorEarning: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "pending_payment",
      index: true,
    },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment", default: null },
    holdExpiresAt: { type: Date, default: null, index: true },
    cancellation: { type: Schema.Types.Mixed, default: null },
    reviewedAt: { type: Date, default: null },
    timeline: {
      type: [
        new Schema<IBookingTimelineEntry>(
          {
            status: String,
            at: { type: Date, default: Date.now },
            by: { type: Schema.Types.ObjectId, ref: "User", default: null },
            note: String,
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { timestamps: true },
);

bookingSchema.index({ vendorId: 1, status: 1, checkIn: 1 });
bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ hotelId: 1, checkIn: 1 });

export const Booking: Model<IBooking> =
  (models.Booking as Model<IBooking>) ?? model<IBooking>("Booking", bookingSchema);

const REF_ALPHABET = "ACDEFGHJKLMNPQRTUVWXY3456789";

/** Human-readable, unambiguous (no O/0, I/1) booking reference. */
export function generateBookingRef(): string {
  let out = "TFZ";
  for (let i = 0; i < 6; i++) {
    out += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
  }
  return out;
}
