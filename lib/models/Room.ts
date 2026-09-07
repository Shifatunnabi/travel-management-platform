import { Schema, model, models, type Model, type Types } from "mongoose";
import { imageSchema, type IImage } from "./Hotel";

/**
 * How the nightly rate is read. `per_room` is the default and what almost every
 * property wants: one price for the room, whoever sleeps in it. A vendor who
 * genuinely sells by the head opts into `per_person`, and then the base price is
 * multiplied by the number of guests.
 */
export const PRICING_MODES = ["per_room", "per_person"] as const;
export type PricingMode = (typeof PRICING_MODES)[number];

export const OPTION_PERIODS = ["night", "stay"] as const;
export type OptionPeriod = (typeof OPTION_PERIODS)[number];

/**
 * An extra a guest ticks on top of the room's base price — breakfast, an
 * airport return transfer, a flexible cancellation policy. Additive, never a
 * separate price for the whole room.
 */
export interface IRoomOption {
  code: string;
  label: string;
  description?: string;
  /** Added to the room price. Per room, not per guest. */
  price: number;
  /** Charged for every night, or once for the whole stay. */
  per: OptionPeriod;
  /** Taking this option means breakfast is included. */
  breakfast: boolean;
  /** Taking this option makes the stay refundable. */
  refundable: boolean;
  /** Free-cancellation cut-off this option buys. Ignored unless `refundable`. */
  cancellationHours: number;
}

/** @deprecated Superseded by `basePrice` + `options`. Read through `resolveRoom`. */
export interface IRatePlan {
  code: string;
  name: string;
  breakfast: boolean;
  refundable: boolean;
  priceDelta: number;
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
  /** Per night. Per room by default; per guest when `pricingMode` says so. */
  basePrice: number;
  pricingMode: PricingMode;
  currency: string;
  /** How many physical rooms of this type exist. */
  totalUnits: number;
  /** What the base price alone buys. */
  breakfast: boolean;
  refundable: boolean;
  cancellationHours: number;
  options: IRoomOption[];
  /** @deprecated Legacy rooms only. */
  ratePlans: IRatePlan[];
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const optionSchema = new Schema<IRoomOption>(
  {
    code: { type: String, required: true },
    label: { type: String, required: true },
    description: String,
    price: { type: Number, required: true, min: 0 },
    per: { type: String, enum: OPTION_PERIODS, default: "night" },
    breakfast: { type: Boolean, default: false },
    refundable: { type: Boolean, default: false },
    cancellationHours: { type: Number, default: 24 },
  },
  { _id: false },
);

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
    pricingMode: { type: String, enum: PRICING_MODES, default: "per_room" },
    currency: { type: String, default: "BDT" },
    totalUnits: { type: Number, required: true, min: 1, default: 1 },
    breakfast: { type: Boolean, default: false },
    refundable: { type: Boolean, default: true },
    cancellationHours: { type: Number, default: 24 },
    options: { type: [optionSchema], default: [] },
    ratePlans: { type: [ratePlanSchema], default: [] },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

roomSchema.index({ hotelId: 1, status: 1 });

export const Room: Model<IRoom> =
  (models.Room as Model<IRoom>) ?? model<IRoom>("Room", roomSchema);
