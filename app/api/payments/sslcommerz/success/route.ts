import { NextResponse } from "next/server";
import { publicEnv } from "@/lib/env";
import { readFields, settlePayment } from "../_settle";

/**
 * Where the gateway sends the guest's browser. Being here proves nothing —
 * `settlePayment` still asks SSLCommerz directly before anything is confirmed.
 */
export async function POST(request: Request) {
  const fields = await readFields(request);
  const result = await settlePayment(fields);

  const target = result.ok
    ? `/book/hotel/${result.ref}/confirmation`
    : `/book/hotel/${result.ref ?? ""}/review?error=${encodeURIComponent(result.reason ?? "Payment failed")}`;

  return NextResponse.redirect(new URL(target, publicEnv.appUrl), 303);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ref = url.searchParams.get("value_a") ?? "";
  return NextResponse.redirect(new URL(`/book/hotel/${ref}/confirmation`, publicEnv.appUrl), 303);
}
