import { Schema, model, models, type Model, type Types } from "mongoose";

/** Singleton — always read and written with `key: "global"`. */
export interface ISettings {
  _id: Types.ObjectId;
  key: string;
  defaultCommissionPct: number;
  taxPct: number;
  serviceFee: number;
  currency: string;
  /** Days after check-out before a vendor's earning becomes withdrawable. */
  settlementDays: number;
  /** How long a checkout holds inventory, in minutes. */
  holdMinutes: number;
  /** Hard cap on how far a platform admin may move a displayed rating. */
  maxRatingOffset: number;
  minPayoutAmount: number;
  supportEmail: string;
  supportPhone: string;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    key: { type: String, default: "global", unique: true },
    defaultCommissionPct: { type: Number, default: 15, min: 0, max: 100 },
    taxPct: { type: Number, default: 5, min: 0 },
    serviceFee: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "BDT" },
    settlementDays: { type: Number, default: 7, min: 0 },
    holdMinutes: { type: Number, default: 15, min: 1 },
    maxRatingOffset: { type: Number, default: 1, min: 0, max: 5 },
    minPayoutAmount: { type: Number, default: 1000, min: 0 },
    supportEmail: { type: String, default: "support@tofiza.com" },
    supportPhone: { type: String, default: "+880 1700-000000" },
  },
  { timestamps: true },
);

export const Settings: Model<ISettings> =
  (models.Settings as Model<ISettings>) ?? model<ISettings>("Settings", settingsSchema);

export const SETTINGS_DEFAULTS = {
  defaultCommissionPct: 15,
  taxPct: 5,
  serviceFee: 0,
  currency: "BDT",
  settlementDays: 7,
  holdMinutes: 15,
  maxRatingOffset: 1,
  minPayoutAmount: 1000,
  supportEmail: "support@tofiza.com",
  supportPhone: "+880 1700-000000",
} as const;
