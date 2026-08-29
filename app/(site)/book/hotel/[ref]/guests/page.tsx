import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCheckoutBooking } from "@/lib/services/booking-read";
import { getSessionUser } from "@/lib/auth/guards";
import CheckoutShell from "@/components/booking/CheckoutShell";
import GuestForm from "@/components/booking/GuestForm";

export const metadata: Metadata = { title: "Guest details · Tofiza", robots: { index: false } };

export default function GuestDetailsPage({ params }: { params: Promise<{ ref: string }> }) {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <Body params={params} />
    </Suspense>
  );
}

async function Body({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const booking = await getCheckoutBooking(ref);
  if (!booking) notFound();

  if (booking.status !== "pending_payment") {
    return <AlreadyHandled bookingRef={booking.ref} status={booking.status} />;
  }

  const user = await getSessionUser();

  return (
    <CheckoutShell booking={booking} step={0}>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h1 className="font-bold text-slate-900 text-lg">Who is staying?</h1>
        <p className="text-sm text-slate-500 mt-1 mb-5">
          The property uses these details at check-in, and we send your voucher here.
        </p>

        {!user && (
          <div className="mb-5 rounded-xl bg-brand-50 border border-brand-200 px-4 py-3 text-sm text-brand-900">
            <Link
              href={`/auth/login?callbackUrl=/book/hotel/${booking.ref}/guests`}
              className="font-semibold underline"
            >
              Sign in
            </Link>{" "}
            to keep this booking in your account — or carry on as a guest.
          </div>
        )}

        <GuestForm
          bookingRef={booking.ref}
          initial={{
            fullName: booking.guestDetails.fullName || user?.name || "",
            email: booking.guestDetails.email || user?.email || "",
            phone: booking.guestDetails.phone || "",
            specialRequests: booking.guestDetails.specialRequests || "",
          }}
        />
      </div>
    </CheckoutShell>
  );
}

export function AlreadyHandled({
  bookingRef,
  status,
}: {
  bookingRef: string;
  status: string;
}) {
  const done = status === "confirmed" || status === "checked_in" || status === "completed";
  return (
    <main className="min-h-screen bg-slate-50 pt-16 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          {done ? "This booking is already confirmed" : "This booking is no longer active"}
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          {done
            ? `Booking ${bookingRef} is confirmed. You can see it in your account.`
            : `Booking ${bookingRef} was ${status.replace(/_/g, " ")}. Search again to make a new one.`}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href={done ? `/book/hotel/${bookingRef}/confirmation` : "/hotels/search"}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {done ? "View booking" : "Search hotels"}
          </Link>
          <Link
            href="/account/bookings"
            className="border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            My bookings
          </Link>
        </div>
      </div>
    </main>
  );
}

export function CheckoutSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50 pt-16" aria-hidden="true">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-white border border-slate-200 rounded-2xl animate-pulse" />
        <div className="h-96 bg-white border border-slate-200 rounded-2xl animate-pulse" />
      </div>
    </main>
  );
}
