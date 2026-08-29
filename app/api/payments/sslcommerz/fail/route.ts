import { NextResponse } from "next/server";
import { publicEnv } from "@/lib/env";
import { readFields, settlePayment } from "../_settle";

export async function POST(request: Request) {
  const fields = await readFields(request);
  const result = await settlePayment({ ...fields, status: "FAILED" });
  const ref = result.ref ?? fields.value_a ?? "";
  return NextResponse.redirect(
    new URL(`/book/hotel/${ref}/review?error=${encodeURIComponent("The payment did not go through.")}`, publicEnv.appUrl),
    303,
  );
}

export const GET = POST;
