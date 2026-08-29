import { NextResponse } from "next/server";
import { readFields, settlePayment } from "../_settle";

/**
 * Server-to-server notification from SSLCommerz. This is the source of truth:
 * it arrives even if the guest closes the tab on the way back.
 */
export async function POST(request: Request) {
  const fields = await readFields(request);
  const result = await settlePayment(fields);

  // Always 200 — a non-2xx makes the gateway retry a decision we have already
  // recorded. The outcome is in our own payment record.
  return NextResponse.json({ received: true, settled: result.ok });
}
