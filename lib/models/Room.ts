import { Schema, model, models, type Model, type Types } from "mongoose";
import { imageSchema, type IImage } from "./Hotel";

export interface IRatePlan {
  code: string;
  name: string;
  breakfast: boolean;
  refundable: boolean;
  /** Added to (or subtracted from) the nightly rate. */
  priceDelta: number;
  /** Free cancellation cut-off, hours before check-in. Ignored when not refundable. */
  cancellationHours: number;
}

export interface IRoom {
  _id: Types.ObjectId;
  hotelId: Types.ObjectId;
  vendorId: Types.ObjectId;
  name: string;
  description: string;
  bedType: string;
  sizeSqm?: number;
  maxAdults: number;
  maxChildren: number;
  images: IImage[];
  amenities: string[];
  basePrice: number;
  currency: string;
  /** How many physical rooms of this type exist. */
  totalUnits: number;
  ratePlans: IRatePlan[];
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const ratePlanSchema = new Schema<IRatePlan>(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    breakfast: { type: Boolean, default: false },
    refundable: { type: Boolean, default: true },
    priceDelta: { type: Number, default: 0 },
    cancellationHours: { type: Number, default: 24 },
  },
  { _id: false },
);

const roomSchema = new Schema<IRoom>(
  {
    hotelId: { type: Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    bedType: { type: String, default: "1 Double Bed" },
    sizeSqm: Number,
    maxAdults: { type: Number, default: 2, min: 1 },
    maxChildren: { type: Number, default: 0, min: 0 },
    images: { type: [imageSchema], default: [] },
    amenities: { type: [String], default: [] },
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "BDT" },
    totalUnits: { type: Number, required: true, min: 1, default: 1 },
    ratePlans: {
      type: [ratePlanSchema],
      default: () => [
        {
          code: "standard",
          name: "Room Only",
          breakfast: false,
          refundable: true,
          priceDelta: 0,
          cancellationHours: 24,
        },
      ],
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

roomSchema.index({ hotelId: 1, status: 1 });

export const Room: Model<IRoom> =
  (models.Room as Model<IRoom>) ?? model<IRoom>("Room", roomSchema);
