import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, LifeBuoy, Building2, ArrowRight } from "lucide-react";
import { CONTACT } from "@/lib/config/contact";

export const metadata: Metadata = {
  title: "Contact Us · Tofiza",
  description:
    "Reach Tofiza Tours & Travels — phone and email support around the clock for bookings, cancellations and partner enquiries.",
};

/**
 * Deliberately not a contact form. A form needs somewhere to deliver to, and
 * until there is a ticketing inbox behind it, a form that silently goes nowhere
 * is worse than no form. These are channels a person actually answers.
 */
export default function ContactPage() {
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
              <li className="text-white font-medium">Contact</li>
            </ol>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Talk to us</h1>
          <p className="mt-3 text-brand-100 text-base leading-relaxed max-w-xl">
            A real person answers, any hour of the day. Have your booking reference to hand and we
            can usually sort it on the first call.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 flex flex-col gap-12">
        {/* Primary channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href={`tel:${CONTACT.phoneE164}`}
            className="group rounded-2xl border border-slate-200 hover:border-brand-400 p-6 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
              <Phone size={18} className="text-brand-600" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Call us
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1 group-hover:text-brand-700 transition-colors">
              {CONTACT.phone}
            </p>
            <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-1.5">
              <Clock size={13} className="shrink-0" />
              Open 24 hours, seven days
            </p>
          </a>

          <a
            href={`mailto:${CONTACT.supportEmail}`}
            className="group rounded-2xl border border-slate-200 hover:border-brand-400 p-6 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
              <Mail size={18} className="text-brand-600" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Email us
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1 group-hover:text-brand-700 transition-colors break-words">
              {CONTACT.supportEmail}
            </p>
            <p className="text-sm text-slate-500 mt-1.5">
              Support and booking enquiries · replies within a few hours
            </p>
          </a>
        </div>

        {/* What to send */}
        <section className="rounded-2xl bg-slate-50 border border-slate-200 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">What to include</h2>
          <p className="text-sm text-slate-600 mt-1.5 max-w-xl">
            Sending these with your first message saves a round trip and gets you an answer faster.
          </p>
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm text-slate-600">
            {[
              "Your booking reference, which starts with TFZ",
              "The property name and your stay dates",
              "The email address you booked with",
              "What you need — cancel, amend, or a question",
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <span aria-hidden="true" className="text-brand-400 font-bold shrink-0">
                  ·
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Routes to self-serve */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              href: "/account/bookings",
              Icon: LifeBuoy,
              title: "Manage a booking",
              copy: "View, download or cancel a stay yourself, any time.",
            },
            {
              href: "/help",
              Icon: Mail,
              title: "Help centre",
              copy: "Answers to the questions we get asked most.",
            },
            {
              href: "/auth/register/partner",
              Icon: Building2,
              title: "List your property",
              copy: "Put your hotel in front of travellers booking today.",
            },
          ].map(({ href, Icon, title, copy }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl border border-slate-200 hover:border-brand-400 p-5 transition-colors flex flex-col gap-2"
            >
              <Icon size={17} className="text-brand-500" />
              <p className="font-bold text-slate-900 text-[15px] group-hover:text-brand-700 transition-colors">
                {title}
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">{copy}</p>
              <span className="text-xs font-semibold text-brand-600 flex items-center gap-1 mt-auto pt-2">
                Open <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </section>

        {/* Registered office */}
        <section className="border-t border-slate-200 pt-8 flex flex-wrap gap-x-12 gap-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Office
            </p>
            <p className="text-sm text-slate-700 flex items-start gap-2 max-w-xs">
              <MapPin size={15} className="text-brand-500 shrink-0 mt-0.5" />
              {CONTACT.address}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Company
            </p>
            <p className="text-sm text-slate-700">
              Tofiza Tours &amp; Travels
              <br />
              Registered in Bangladesh
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
