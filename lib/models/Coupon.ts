import { Schema, model, models, type Model, type Types } from "mongoose";
import { COUPON_SCOPES, type CouponScope } from "./types";

export interface ICoupon {
  _id: Types.ObjectId;
  code: string;
  description?: string;
  scope: CouponScope;
  /** Set when scope is "vendor" — cost comes out of that vendor's earnings. */
  vendorId?: Types.ObjectId | null;
  type: "percent" | "fixed";
  value: number;
  maxDiscount?: number | null;
  minSpend: number;
  usageLimit?: number | null;
  perUserLimit: number;
  usedCount: number;
  validFrom: Date;
  validTo: Date;
  appliesTo: { hotelIds: Types.ObjectId[]; cities: string[] };
  status: "active" | "paused" | "expired";
  createdBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    scope: { type: String, enum: COUPON_SCOPES, default: "platform", index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", default: null, index: true },
    type: { type: String, enum: ["percent", "fixed"], default: "percent" },
    value: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, default: null },
    minSpend: { type: Number, default: 0 },
    usageLimit: { type: Number, default: null },
    perUserLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    appliesTo: {
      hotelIds: [{ type: Schema.Types.ObjectId, ref: "Hotel" }],
      cities: [String],
    },
    status: { type: String, enum: ["active", "paused", "expired"], default: "active", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export const Coupon: Model<ICoupon> =
  (models.Coupon as Model<ICoupon>) ?? model<ICoupon>("Coupon", couponSchema);
