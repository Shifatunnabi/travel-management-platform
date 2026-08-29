import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle, Lock, Pencil } from "lucide-react";
import { getCheckoutBooking } from "@/lib/services/booking-read";
import { isPaymentConfigured } from "@/lib/env";
import CheckoutShell from "@/components/booking/CheckoutShell";
import CouponForm from "@/components/booking/CouponForm";
import PayButton from "@/components/booking/PayButton";
import { AlreadyHandled, CheckoutSkeleton } from "../guests/page";

export const metadata: Metadata = { title: "Review and pay · Tofiza", robots: { index: false } };

export default function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <Body params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { ref } = await params;
  const { error } = await searchParams;
  const booking = await getCheckoutBooking(ref);
  if (!booking) notFound();

  if (booking.status !== "pending_payment") {
    return <AlreadyHandled bookingRef={booking.ref} status={booking.status} />;
  }

  const paymentReady = isPaymentConfigured();

  return (
    <CheckoutShell booking={booking} step={1}>
      <div className="space-y-4">
        {error && (
          <div role="alert" className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 flex gap-3">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-rose-900">Payment did not complete</p>
              <p className="text-sm text-rose-800 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h1 className="font-bold text-slate-900 text-lg">Check your details</h1>
            <Link
              href={`/book/hotel/${booking.ref}/guests`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <Pencil size={12} /> Edit
            </Link>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ["Lead guest", booking.guestDetails.fullName],
              ["Email", booking.guestDetails.email],
              ["Phone", booking.guestDetails.phone],
              ["Reference", booking.ref],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-800 break-words">{value}</dd>
              </div>
            ))}
          </dl>
          {booking.guestDetails.specialRequests && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">Special requests</p>
              <p className="text-sm text-slate-700 mt-0.5">{booking.guestDetails.specialRequests}</p>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-1">Have a promo code?</h2>
          <p className="text-sm text-slate-500 mb-4">
            Codes are checked against this property, your dates, and the amount.
          </p>
          <CouponForm
            bookingRef={booking.ref}
            appliedCode={booking.pricing.couponCode}
            discount={booking.pricing.discount}
          />
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-1">Payment</h2>
          <p className="text-sm text-slate-500 mb-4">
            You will be taken to SSLCommerz to pay by card, bKash, Nagad, Rocket, or net banking.
            Your booking is confirmed the moment payment is verified.
          </p>

          {paymentReady ? (
            <PayButton bookingRef={booking.ref} amount={booking.pricing.grandTotal} />
          ) : (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
              <p className="font-semibold">Card payment is not switched on yet</p>
              <p className="mt-0.5">
                Your room is held under reference <strong>{booking.ref}</strong>. Add the SSLCommerz
                store credentials to enable checkout.
              </p>
            </div>
          )}

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-4">
            <Lock size={11} aria-hidden="true" />
            Card details are entered on SSLCommerz and never reach Tofiza&apos;s servers.
          </p>
        </section>
      </div>
    </CheckoutShell>
  );
}
