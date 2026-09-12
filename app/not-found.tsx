import Link from "next/link";
import Image from "next/image";
import { Search, LifeBuoy, Home, Phone } from "lucide-react";
import { CONTACT } from "@/lib/config/contact";

/**
 * Shown for any URL that matches no route. This renders inside the root layout
 * rather than the public site layout, so it carries its own header and links —
 * without them a mistyped URL was a dead end with no way back into the site.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <div className="border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link href="/" aria-label="Tofiza Tours & Travels — home" className="inline-block">
            <Image
              src="/asset/tofiza.png"
              alt="Tofiza Tours &amp; Travels"
              width={306}
              height={90}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-400">
            Error 404
          </p>
          <h1 className="mt-3 text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight text-balance">
            We cannot find that page
          </h1>
          <p className="mt-3 text-slate-500 text-base leading-relaxed max-w-lg">
            The link may be out of date, or the address may have a typo in it. Your bookings are
            safe — nothing has been lost.
          </p>

          <div className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            {[
              {
                href: "/hotels/search",
                Icon: Search,
                title: "Find a hotel",
                copy: "Search live rates by city and dates.",
              },
              {
                href: "/account/bookings",
                Icon: LifeBuoy,
                title: "Manage a booking",
                copy: "View or cancel a stay you booked.",
              },
              {
                href: "/help",
                Icon: Home,
                title: "Help centre",
                copy: "Answers to the common questions.",
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
              </Link>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Back to Tofiza
            </Link>
            <a
              href={`tel:${CONTACT.phoneE164}`}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-700 transition-colors"
            >
              <Phone size={14} />
              {CONTACT.phone}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
