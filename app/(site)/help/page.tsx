import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, Search, CalendarCheck, CreditCard, RotateCcw } from "lucide-react";
import { faqs } from "@/lib/mock-data";
import { CONTACT } from "@/lib/config/contact";

export const metadata: Metadata = {
  title: "Help Centre · Tofiza",
  description:
    "Answers to the questions Tofiza guests ask most — booking, payment, confirmations, changes and refunds.",
};

const steps = [
  {
    Icon: Search,
    title: "Search",
    copy: "Pick your city and dates. We only show properties with live availability for those nights.",
  },
  {
    Icon: CalendarCheck,
    title: "Hold",
    copy: "Choosing a room holds it for 15 minutes and freezes the price while you check out.",
  },
  {
    Icon: CreditCard,
    title: "Pay",
    copy: "Card or mobile wallet on the gateway's secure page. Your card details never reach us.",
  },
  {
    Icon: RotateCcw,
    title: "Manage",
    copy: "View, download or cancel the booking yourself from your account, any time.",
  },
];

/**
 * Uses native <details> rather than a client-side accordion — the answers are
 * then in the page for search engines and for anyone with JavaScript off, and
 * the page ships no JS of its own.
 */
export default function HelpPage() {
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
              <li className="text-white font-medium">Help Centre</li>
            </ol>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Help Centre</h1>
          <p className="mt-3 text-brand-100 text-base leading-relaxed max-w-xl">
            How booking with Tofiza works, and answers to what guests ask us most.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 flex flex-col gap-14">
        {/* How a booking works — a real sequence, so it is numbered. */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6">How a booking works</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map(({ Icon, title, copy }, i) => (
              <li
                key={title}
                className="rounded-2xl border border-slate-200 p-5 flex flex-col gap-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Icon size={15} />
                  </span>
                  <span className="text-[11px] font-bold text-slate-300 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-[15px]">{title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{copy}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Common questions</h2>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map((faq) => (
              <details key={faq.id} className="group py-4">
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none font-semibold text-[15px] text-slate-800 hover:text-brand-700 transition-colors">
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-slate-300 text-xl leading-none mt-[-2px] group-open:rotate-45 transition-transform"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-600 max-w-2xl pr-8">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Policies */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-2">The detail</h2>
          <p className="text-sm text-slate-500 mb-5 max-w-xl">
            The full rules behind the answers above.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: "/refunds", title: "Refund Policy", copy: "When a booking is refundable, and how long the money takes." },
              { href: "/fare-rules", title: "Rate Rules", copy: "How a nightly price is built, and when it locks in." },
              { href: "/terms", title: "Terms of Service", copy: "The agreement covering your booking." },
              { href: "/privacy", title: "Privacy Policy", copy: "What we hold about you, and who else sees it." },
            ].map(({ href, title, copy }) => (
              <Link
                key={href}
                href={href}
                className="rounded-xl border border-slate-200 hover:border-brand-400 px-5 py-4 transition-colors group"
              >
                <p className="font-semibold text-slate-900 text-[15px] group-hover:text-brand-700 transition-colors">
                  {title}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">{copy}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Still stuck */}
        <section className="rounded-2xl bg-slate-50 border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Still stuck?</h2>
            <p className="text-sm text-slate-600 mt-1">
              We answer around the clock. Have your TFZ reference ready.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <a
              href={`tel:${CONTACT.phoneE164}`}
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Phone size={15} />
              {CONTACT.phone}
            </a>
            <a
              href={`mailto:${CONTACT.supportEmail}`}
              className="inline-flex items-center gap-2 border border-slate-300 hover:border-brand-400 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Mail size={15} />
              Email support
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
