import { Schema, model, models, type Model, type Types } from "mongoose";
import { LEDGER_TYPES, type LedgerType } from "./types";

/**
 * Every movement of money is a signed row. Balances are derived by summing
 * this collection, never by re-adding bookings — so refunds, adjustments and
 * payouts all reduce the same number without special cases.
 */
export interface ILedgerEntry {
  _id: Types.ObjectId;
  vendorId: Types.ObjectId;
  bookingId?: Types.ObjectId | null;
  payoutId?: Types.ObjectId | null;
  type: LedgerType;
  /** Positive credits the vendor, negative debits them. */
  amount: number;
  currency: string;
  /** When this entry becomes withdrawable. Null means immediately. */
  availableAt?: Date | null;
  /** Set once the entry has been included in a paid disbursement. */
  settledAt?: Date | null;
  note?: string;
  createdBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const ledgerSchema = new Schema<ILedgerEntry>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
    payoutId: { type: Schema.Types.ObjectId, ref: "Payout", default: null, index: true },
    type: { type: String, enum: LEDGER_TYPES, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "BDT" },
    availableAt: { type: Date, default: null },
    settledAt: { type: Date, default: null },
    note: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

ledgerSchema.index({ vendorId: 1, createdAt: -1 });
ledgerSchema.index({ vendorId: 1, type: 1, availableAt: 1 });

export const LedgerEntry: Model<ILedgerEntry> =
  (models.LedgerEntry as Model<ILedgerEntry>) ??
  model<ILedgerEntry>("LedgerEntry", ledgerSchema);
