import Link from "next/link";
import { Plane, Search, ArrowRight } from "lucide-react";
import { CONTACT } from "@/lib/config/contact";

/**
 * Stands in for every /flights route while `FEATURES.flights` is off.
 *
 * Deliberately gives no way further into the flight screens — those still take
 * a customer through a checkout that takes no payment and then tells them a
 * flight is booked.
 */
export default function FlightsComingSoon() {
  return (
    <main className="min-h-screen bg-white pt-16 flex items-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1.5">
          <Plane size={13} />
          Coming soon
        </span>

        <h1 className="mt-5 text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight text-balance">
          Flight booking is not open yet
        </h1>
        <p className="mt-3 text-slate-500 text-base leading-relaxed max-w-lg">
          We are finishing airline fares and ticketing. Nothing on Tofiza can be booked as a flight
          today — when it can, every fare will show its baggage allowance, change fees and refund
          terms before you pay.
        </p>

        <div className="mt-9 max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/hotels/search"
            className="group rounded-2xl border border-slate-200 hover:border-brand-400 p-5 transition-colors flex flex-col gap-2"
          >
            <Search size={17} className="text-brand-500" />
            <p className="font-bold text-slate-900 text-[15px] group-hover:text-brand-700 transition-colors">
              Book a hotel instead
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Hotels are live across Bangladesh and beyond, with real availability for your dates.
            </p>
            <span className="text-xs font-semibold text-brand-600 flex items-center gap-1 mt-auto pt-2">
              Search hotels <ArrowRight size={12} />
            </span>
          </Link>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex flex-col gap-2">
            <p className="font-bold text-slate-900 text-[15px]">Need to fly sooner?</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Talk to our travel desk and we will arrange it with you directly.
            </p>
            <a
              href={`tel:${CONTACT.phoneE164}`}
              className="text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors mt-auto pt-2"
            >
              {CONTACT.phone}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
