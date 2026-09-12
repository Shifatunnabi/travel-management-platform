import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, BadgeCheck, Headset, Building2, ArrowRight } from "lucide-react";
import { CONTACT } from "@/lib/config/contact";

export const metadata: Metadata = {
  title: "About Us · Tofiza",
  description:
    "Tofiza Tours & Travels is a Bangladesh-based hotel booking platform — verified properties, live rates, and support around the clock.",
};

const principles = [
  {
    Icon: BadgeCheck,
    title: "Verified before it is listed",
    copy: "Every property is checked by our team before it goes live, and reviews come only from guests who actually stayed. We would rather list fewer hotels than list ones we cannot stand behind.",
  },
  {
    Icon: ShieldCheck,
    title: "The price you see is the price you pay",
    copy: "Taxes, fees and any extras you choose are in the total before you reach the payment page. Our commission comes out of the property's share, never added to your bill.",
  },
  {
    Icon: Headset,
    title: "A person on the other end",
    copy: "Support is answered by people, at any hour, on a Bangladeshi number. Bookings go wrong sometimes; what matters is who picks up when they do.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white pt-16">
      <header className="bg-brand-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-brand-200">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-white font-medium">About</li>
            </ol>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-balance">
            Booking a room in Bangladesh should be simple
          </h1>
          <p className="mt-4 text-brand-100 text-base leading-relaxed max-w-2xl">
            Tofiza Tours &amp; Travels is a booking platform built in Dhaka, for people travelling
            here and from here. We connect you directly with properties that have real availability
            at a real price, and we stay reachable if anything needs sorting.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 flex flex-col gap-14">
        <section className="max-w-2xl">
          <h2 className="text-xl font-bold text-slate-900 mb-4">What we do</h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-slate-600">
            <p>
              We list hotels and resorts across Bangladesh — Cox&apos;s Bazar, Dhaka, Sylhet,
              Chittagong — alongside international destinations, and we take the booking end to end:
              live rates for your dates, a room held while you pay, payment through SSLCommerz, and
              an invoice in your inbox before you have closed the tab.
            </p>
            <p>
              Properties manage their own rooms, rates and availability through our partner
              dashboard, which is why what you see is what is genuinely open for sale on the night
              you asked for, rather than a price from a stale feed.
            </p>
            <p>
              Flight booking is in progress and will open once airline fares and ticketing are in
              place. Until then, hotels are what we do, and we would rather do one thing properly
              than two things halfway.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6">How we work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {principles.map(({ Icon, title, copy }) => (
              <div key={title} className="rounded-2xl border border-slate-200 p-6 flex flex-col gap-3">
                <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Icon size={18} />
                </span>
                <h3 className="font-bold text-slate-900 text-[15px] text-balance">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-slate-50 border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="max-w-md">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 size={18} className="text-brand-600" />
              Run a property?
            </h2>
            <p className="text-sm text-slate-600 mt-1.5">
              List it with us and manage your own rates, availability and bookings. You are paid
              after each guest checks out, to your verified bank account.
            </p>
          </div>
          <Link
            href="/auth/register/partner"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shrink-0"
          >
            List your property <ArrowRight size={15} />
          </Link>
        </section>

        <section className="border-t border-slate-200 pt-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Find us
          </p>
          <p className="text-sm text-slate-600">
            Tofiza Tours &amp; Travels · {CONTACT.address}
            <br />
            {CONTACT.phone} ·{" "}
            <a
              href={`mailto:${CONTACT.supportEmail}`}
              className="text-brand-700 font-semibold hover:underline"
            >
              {CONTACT.supportEmail}
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
