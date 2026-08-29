import { Schema, model, models, type Model, type Types } from "mongoose";
import { PAYOUT_STATUSES, type PayoutStatus } from "./types";

export interface IPayout {
  _id: Types.ObjectId;
  vendorId: Types.ObjectId;
  requestedAmount: number;
  approvedAmount?: number | null;
  currency: string;
  status: PayoutStatus;
  /** Copied at request time so a later bank-detail change cannot rewrite history. */
  bankSnapshot: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    branch?: string;
    routingNumber?: string;
  };
  requestedBy: Types.ObjectId;
  reviewedBy?: Types.ObjectId | null;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
  /** Bank/bKash transaction reference, filled when marked paid. */
  paymentReference?: string | null;
  paidAt?: Date | null;
  note?: string;
  timeline: { status: PayoutStatus; at: Date; by?: Types.ObjectId | null; note?: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const payoutSchema = new Schema<IPayout>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    requestedAmount: { type: Number, required: true, min: 1 },
    approvedAmount: { type: Number, default: null },
    currency: { type: String, default: "BDT" },
    status: { type: String, enum: PAYOUT_STATUSES, default: "requested", index: true },
    bankSnapshot: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      branch: String,
      routingNumber: String,
    },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
    paymentReference: { type: String, default: null },
    paidAt: { type: Date, default: null },
    note: String,
    timeline: {
      type: [
        new Schema(
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

payoutSchema.index({ vendorId: 1, status: 1 });
payoutSchema.index({ status: 1, createdAt: 1 });

export const Payout: Model<IPayout> =
  (models.Payout as Model<IPayout>) ?? model<IPayout>("Payout", payoutSchema);
