import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { env } from "@/lib/env";
import { releaseExpiredHolds } from "@/lib/services/booking-flow";

/**
 * Frees rooms from checkouts that were never paid for. Point a scheduler at
 * this every few minutes. It is a backstop: every page that shows availability
 * also releases expired holds for the rooms it is about to show. Protected by
 * AUTH_SECRET so it cannot be triggered from outside.
 */
async function sweep() {
  const auth = (await headers()).get("authorization");
  if (auth !== `Bearer ${env.AUTH_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const released = await releaseExpiredHolds();
  return NextResponse.json({ released });
}

// Schedulers differ on the verb — Vercel cron sends GET, most others POST.
export { sweep as GET, sweep as POST };
