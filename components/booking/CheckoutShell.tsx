import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Check } from "lucide-react";
import { cdn } from "@/lib/services/cloudinary";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { CheckoutBooking } from "@/lib/services/booking-read";
import HoldTimer from "./HoldTimer";

const STEPS = ["Guest details", "Review & pay", "Confirmation"] as const;

export default function CheckoutShell({
  booking,
  step,
  children,
}: {
  booking: CheckoutBooking;
  step: 0 | 1 | 2;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 pt-16">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm mb-3">
            <Link href="/" className="text-slate-500 hover:text-brand-600">Home</Link>
            <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
            <Link
              href={`/hotels/${citySlug(booking.hotelCity)}/${booking.hotelSlug}`}
              className="text-slate-500 hover:text-brand-600 truncate max-w-48"
            >
              {booking.hotelName}
            </Link>
            <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
            <span className="text-slate-800 font-medium">{STEPS[step]}</span>
          </nav>

          <ol className="flex items-center">
            {STEPS.map((label, i) => (
              <li key={label} className="flex items-center">
                <div className={`flex items-center gap-2 ${i === step ? "text-brand-700" : i < step ? "text-emerald-600" : "text-slate-400"}`}>
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === step ? "bg-brand-600 text-white" : i < step ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {i < step ? <Check size={13} aria-hidden="true" /> : i + 1}
                  </span>
                  <span className="text-sm font-medium hidden sm:block">{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className={`h-px w-8 sm:w-16 mx-2 ${i < step ? "bg-emerald-300" : "bg-slate-200"}`} aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">{children}</div>
          <aside className="space-y-4">
            <BookingSummary booking={booking} />
            {step < 2 && booking.holdExpiresAt && (
              <HoldTimer secondsLeft={booking.holdSecondsLeft} />
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

export function BookingSummary({ booking }: { booking: CheckoutBooking }) {
  const p = booking.pricing;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden lg:sticky lg:top-24">
      {booking.hotelImage && (
        <div className="relative h-32 bg-slate-100">
          <Image
            src={cdn(booking.hotelImage, 600, 260)}
            alt={booking.hotelName}
            fill
            sizes="400px"
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <h2 className="font-bold text-slate-900">{booking.hotelName}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{booking.hotelAddress}</p>

        <dl className="mt-4 space-y-2 text-sm border-t border-slate-100 pt-4">
          <Row label="Room" value={`${booking.units} × ${booking.roomName}`} />
          <Row label="Rate" value={booking.ratePlanName} />
          <Row label="Check-in" value={formatDate(booking.checkIn)} />
          <Row label="Check-out" value={formatDate(booking.checkOut)} />
          <Row label="Nights" value={String(booking.nights)} />
          <Row
            label="Guests"
            value={`${booking.guests.adults} adults${booking.guests.children ? `, ${booking.guests.children} children` : ""}`}
          />
        </dl>

        <dl className="mt-4 space-y-2 text-sm border-t border-slate-100 pt-4">
          <Row label={`Rooms · ${booking.nights} nights`} value={formatCurrency(p.roomTotal, p.currency)} />
          {p.discount > 0 && (
            <Row
              label={`Discount${p.couponCode ? ` (${p.couponCode})` : ""}`}
              value={`− ${formatCurrency(p.discount, p.currency)}`}
              tone="emerald"
            />
          )}
          <Row label="Taxes" value={formatCurrency(p.taxes, p.currency)} />
          {p.serviceFee > 0 && <Row label="Service fee" value={formatCurrency(p.serviceFee, p.currency)} />}
        </dl>

        <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-slate-200">
          <span className="font-bold text-slate-900">Total</span>
          <span className="text-xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(p.grandTotal, p.currency)}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 mt-2">
          {booking.refundable
            ? `Free cancellation up to ${booking.cancellationHours}h before check-in.`
            : "This rate is non-refundable."}
          {booking.breakfast && " Breakfast included."}
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "emerald" }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`font-medium text-right tabular-nums ${tone === "emerald" ? "text-emerald-600" : "text-slate-800"}`}>
        {value}
      </dd>
    </div>
  );
}

function citySlug(city: string): string {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
