import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CheckCircle, Mail, Building2, Calendar, Users, LayoutDashboard, Home, Clock,
} from "lucide-react";
import { getCheckoutBooking } from "@/lib/services/booking-read";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { CheckoutSkeleton } from "../guests/page";

export const metadata: Metadata = { title: "Booking confirmed · Tofiza", robots: { index: false } };

export default function ConfirmationPage({ params }: { params: Promise<{ ref: string }> }) {
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

  const paid = ["confirmed", "checked_in", "completed"].includes(booking.status);

  return (
    <main className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 ${
              paid ? "bg-emerald-100" : "bg-amber-100"
            }`}
          >
            {paid ? (
              <CheckCircle size={40} className="text-emerald-500" aria-hidden="true" />
            ) : (
              <Clock size={40} className="text-amber-500" aria-hidden="true" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {paid ? "Your stay is confirmed" : "Payment still processing"}
          </h1>
          <p className="text-slate-500">
            {paid
              ? "We have emailed your voucher. The property has been notified."
              : "We are waiting for the gateway to confirm. This page updates once it does."}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-brand-700 text-white px-6 py-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-brand-200 text-xs uppercase tracking-wider">Booking reference</p>
              <p className="text-2xl font-bold tracking-wide">{booking.ref}</p>
            </div>
            <p className="text-right">
              <span className="block text-brand-200 text-xs">Total paid</span>
              <span className="text-xl font-bold tabular-nums">
                {formatCurrency(booking.pricing.grandTotal, booking.pricing.currency)}
              </span>
            </p>
          </div>

          <dl className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Detail icon={Building2} label="Property">
              <span className="font-semibold text-slate-900">{booking.hotelName}</span>
              <span className="block text-xs text-slate-500 mt-0.5">{booking.hotelAddress}</span>
            </Detail>
            <Detail icon={Users} label="Room">
              <span className="font-semibold text-slate-900">
                {booking.units} × {booking.roomName}
              </span>
              <span className="block text-xs text-slate-500 mt-0.5">
                {booking.ratePlanName}
                {booking.breakfast && " · breakfast included"}
              </span>
            </Detail>
            <Detail icon={Calendar} label="Stay">
              <span className="font-semibold text-slate-900">
                {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
              </span>
              <span className="block text-xs text-slate-500 mt-0.5">
                {booking.nights} night{booking.nights === 1 ? "" : "s"} ·{" "}
                {booking.guests.adults} adults
                {booking.guests.children > 0 && `, ${booking.guests.children} children`}
              </span>
            </Detail>
            <Detail icon={Mail} label="Voucher sent to">
              <span className="font-semibold text-slate-900 break-words">
                {booking.guestDetails.email}
              </span>
              <span className="block text-xs text-slate-500 mt-0.5">
                {booking.guestDetails.fullName}
              </span>
            </Detail>
          </dl>

          <div className="px-6 pb-6">
            <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-3">
              {booking.refundable
                ? `Free cancellation up to ${booking.cancellationHours} hours before check-in. After that this rate is non-refundable.`
                : "This is a non-refundable rate. Changes and cancellations are not permitted."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link
            href="/account/bookings"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors"
          >
            <LayoutDashboard size={16} aria-hidden="true" /> My bookings
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-slate-200 hover:border-brand-300 text-slate-700 font-bold rounded-xl transition-colors"
          >
            <Home size={16} aria-hidden="true" /> Back to Tofiza
          </Link>
        </div>
      </div>
    </main>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon size={17} className="text-slate-400 shrink-0 mt-0.5" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="text-sm">{children}</dd>
      </div>
    </div>
  );
}
