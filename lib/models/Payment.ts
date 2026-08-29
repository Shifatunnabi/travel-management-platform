import { Schema, model, models, type Model, type Types } from "mongoose";
import { PAYMENT_STATUSES, type PaymentStatus } from "./types";

export interface IRefund {
  amount: number;
  refundRefId?: string;
  reason?: string;
  by?: Types.ObjectId | null;
  at: Date;
}

export interface IPayment {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  gateway: "sslcommerz";
  tranId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  /** Returned by SSLCommerz; required to call the validation API. */
  valId?: string | null;
  bankTranId?: string | null;
  cardType?: string | null;
  cardIssuer?: string | null;
  /** Raw gateway response, kept for reconciliation and disputes. */
  gatewayPayload?: Record<string, unknown> | null;
  validatedAt?: Date | null;
  failureReason?: string | null;
  refunds: IRefund[];
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    gateway: { type: String, default: "sslcommerz" },
    tranId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "BDT" },
    status: { type: String, enum: PAYMENT_STATUSES, default: "initiated", index: true },
    valId: { type: String, default: null },
    bankTranId: { type: String, default: null },
    cardType: { type: String, default: null },
    cardIssuer: { type: String, default: null },
    gatewayPayload: { type: Schema.Types.Mixed, default: null },
    validatedAt: { type: Date, default: null },
    failureReason: { type: String, default: null },
    refunds: {
      type: [
        new Schema<IRefund>(
          {
            amount: Number,
            refundRefId: String,
            reason: String,
            by: { type: Schema.Types.ObjectId, ref: "User", default: null },
            at: { type: Date, default: Date.now },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const Payment: Model<IPayment> =
  (models.Payment as Model<IPayment>) ?? model<IPayment>("Payment", paymentSchema);
