import { connectDB } from "@/lib/db/connect";
import { Payment } from "@/lib/models/Payment";
import { Booking } from "@/lib/models/Booking";
import { validatePayment } from "@/lib/services/sslcommerz";
import { confirmBooking, failBooking } from "@/lib/services/booking-flow";

export interface SettleResult {
  ok: boolean;
  ref?: string;
  reason?: string;
}

/**
 * The single place a payment is trusted. Both the IPN and the browser redirect
 * funnel through here, and neither is believed until SSLCommerz confirms the
 * transaction and every field matches what we stored.
 */
export async function settlePayment(fields: Record<string, string>): Promise<SettleResult> {
  const tranId = fields.tran_id;
  const valId = fields.val_id;

  if (!tranId) return { ok: false, reason: "No transaction id supplied." };

  await connectDB();
  const payment = await Payment.findOne({ tranId });
  if (!payment) return { ok: false, reason: "Unknown transaction." };

  const booking = await Booking.findById(payment.bookingId);
  if (!booking) return { ok: false, reason: "Booking not found." };

  // Already settled — the IPN and the redirect both arrive, in any order.
  if (payment.status === "success") {
    return { ok: true, ref: booking.ref };
  }

  const gatewayStatus = fields.status ?? "";
  if (gatewayStatus === "FAILED" || gatewayStatus === "CANCELLED") {
    payment.status = gatewayStatus === "FAILED" ? "failed" : "cancelled";
    payment.failureReason = fields.error || gatewayStatus;
    payment.gatewayPayload = fields;
    await payment.save();
    await failBooking(String(booking._id), `Payment ${gatewayStatus.toLowerCase()}`);
    return { ok: false, ref: booking.ref, reason: payment.failureReason };
  }

  if (!valId) return { ok: false, ref: booking.ref, reason: "No validation id supplied." };

  const validation = await validatePayment(valId);
  if (!validation.valid) {
    payment.status = "failed";
    payment.failureReason = validation.error ?? `Gateway status ${validation.status}`;
    payment.gatewayPayload = fields;
    await payment.save();
    await failBooking(String(booking._id), "Payment could not be validated");
    return { ok: false, ref: booking.ref, reason: payment.failureReason };
  }

  // Never trust the posted amount — compare the gateway's own answer with what
  // we recorded when the session was opened.
  const amountMatches = Math.abs((validation.amount ?? 0) - payment.amount) < 1;
  const currencyMatches = (validation.currency ?? "") === payment.currency;
  const tranMatches = (validation.tranId ?? "") === payment.tranId;

  if (!amountMatches || !currencyMatches || !tranMatches) {
    payment.status = "failed";
    payment.failureReason = `Mismatch — expected ${payment.amount} ${payment.currency} / ${payment.tranId}, gateway said ${validation.amount} ${validation.currency} / ${validation.tranId}`;
    payment.gatewayPayload = { fields, validation: validation.raw };
    await payment.save();
    console.error("[payments] validation mismatch on", payment.tranId, payment.failureReason);
    return { ok: false, ref: booking.ref, reason: "The payment details did not match this booking." };
  }

  payment.status = "success";
  payment.valId = valId;
  payment.bankTranId = validation.bankTranId ?? null;
  payment.cardType = validation.cardType ?? null;
  payment.cardIssuer = validation.cardIssuer ?? null;
  payment.validatedAt = new Date();
  payment.gatewayPayload = { fields, validation: validation.raw };
  await payment.save();

  await confirmBooking(String(booking._id), String(payment._id));
  return { ok: true, ref: booking.ref };
}

/** SSLCommerz posts urlencoded form bodies. */
export async function readFields(request: Request): Promise<Record<string, string>> {
  try {
    const form = await request.formData();
    const out: Record<string, string> = {};
    for (const [k, v] of form.entries()) out[k] = String(v);
    return out;
  } catch {
    return {};
  }
}
