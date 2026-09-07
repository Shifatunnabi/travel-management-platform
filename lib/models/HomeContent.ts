import { Schema, model, models, type Model, type Types } from "mongoose";
import { imageSchema, type IImage } from "./Hotel";

/**
 * The two homepage rails a platform admin curates by hand: where to go, and
 * what is on offer this week. Both were hard-coded fixtures until now, which
 * meant a price change needed a deploy.
 */

export const OFFER_TYPES = ["hotel", "flight"] as const;
export type OfferType = (typeof OFFER_TYPES)[number];

export interface IDestination {
  _id: Types.ObjectId;
  city: string;
  country: string;
  description: string;
  image: IImage;
  startingPrice: number;
  currency: string;
  /** e.g. "1h 05m". Shown as a badge when set. */
  flightDuration?: string;
  /** Where the card links. Defaults to a flight search for the city. */
  href?: string;
  /** Lower sorts first. */
  order: number;
  status: "published" | "hidden";
  createdAt: Date;
  updatedAt: Date;
}

export interface IOffer {
  _id: Types.ObjectId;
  title: string;
  description: string;
  image: IImage;
  /** Shown on the badge, e.g. "25% OFF". Free text — it is marketing copy. */
  discount: string;
  code?: string;
  type: OfferType;
  href?: string;
  expiresAt: Date;
  order: number;
  status: "published" | "hidden";
  createdAt: Date;
  updatedAt: Date;
}

const destinationSchema = new Schema<IDestination>(
  {
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: { type: imageSchema, required: true },
    startingPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "BDT" },
    flightDuration: String,
    href: String,
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["published", "hidden"], default: "published", index: true },
  },
  { timestamps: true },
);

const offerSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: { type: imageSchema, required: true },
    discount: { type: String, required: true },
    code: String,
    type: { type: String, enum: OFFER_TYPES, default: "hotel" },
    href: String,
    expiresAt: { type: Date, required: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["published", "hidden"], default: "published", index: true },
  },
  { timestamps: true },
);

destinationSchema.index({ status: 1, order: 1 });
offerSchema.index({ status: 1, order: 1 });

export const Destination: Model<IDestination> =
  (models.Destination as Model<IDestination>) ?? model<IDestination>("Destination", destinationSchema);

export const Offer: Model<IOffer> =
  (models.Offer as Model<IOffer>) ?? model<IOffer>("Offer", offerSchema);
