import { Suspense } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/guards";
import { startBooking, BookingError } from "@/lib/services/booking-flow";
import { InventoryConflictError } from "@/lib/services/inventory";
import { startBookingSchema } from "@/lib/validation/booking";

/**
 * Entered from a "Reserve" button. Creates the hold, then hands off to the
 * guest-details step under a real booking reference.
 */
export default function StartBookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <main className="min-h-screen bg-slate-50 pt-16 flex items-center justify-center p-6">
      <Suspense fallback={<Holding />}>
        <Hold searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Hold({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const parsed = startBookingSchema.safeParse(params);
  if (!parsed.success) {
    return <Problem message="That booking link is incomplete. Pick your dates and room again." />;
  }

  const user = await getSessionUser();
  const d = parsed.data;

  let ref: string;
  try {
    ref = await startBooking({
      roomId: d.roomId,
      ratePlanCode: d.plan,
      checkIn: d.checkIn,
      checkOut: d.checkOut,
      units: d.rooms,
      adults: d.guests,
      children: 0,
      customerId: user?.id,
    });
  } catch (error) {
    if (error instanceof InventoryConflictError || error instanceof BookingError) {
      return <Problem message={error.message} />;
    }
    console.error("[booking] start failed:", error);
    return <Problem message="We could not hold that room. Please try again." />;
  }

  redirect(`/book/hotel/${ref}/guests`);
}

function Holding() {
  return (
    <div className="text-center" aria-live="polite">
      <div className="w-12 h-12 rounded-full border-3 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-4" />
      <p className="font-semibold text-slate-800">Holding your room</p>
      <p className="text-sm text-slate-500 mt-1">This takes a second.</p>
    </div>
  );
}

function Problem({ message }: { message: string }) {
  return (
    <div className="max-w-md text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={24} className="text-amber-600" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">We could not hold that room</h1>
      <p className="text-slate-500 text-sm mb-6">{message}</p>
      <Link
        href="/hotels/search"
        className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        Back to search
      </Link>
    </div>
  );
}
