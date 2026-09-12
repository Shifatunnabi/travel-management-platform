import Link from "next/link";
import type { ReactNode } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { CONTACT } from "@/lib/config/contact";

export interface PolicySection {
  /** Anchor target, also used by the contents list. */
  id: string;
  heading: string;
  body: ReactNode;
}

/**
 * Shared chrome for every policy document — privacy, terms, cookies, refunds,
 * fare rules. One shell means the whole set reads as one publication, and a
 * new policy is a content file rather than another page layout.
 */
export default function PolicyPage({
  title,
  summary,
  effective,
  sections,
}: {
  title: string;
  /** One or two plain sentences a reader can stop at. */
  summary: string;
  /** Effective date, written out — a fixed string, not today's clock. */
  effective: string;
  sections: PolicySection[];
}) {
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
              <li className="text-white font-medium">{title}</li>
            </ol>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mt-3 text-brand-100 text-base leading-relaxed max-w-2xl">{summary}</p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-brand-300">
            Effective {effective}
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-12">
          {/* Contents — a document this long needs a way in. */}
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                On this page
              </p>
              <ol className="space-y-2 border-l border-slate-200">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block -ml-px border-l-2 border-transparent pl-3 text-[13px] leading-snug text-slate-500 hover:border-brand-500 hover:text-brand-700 transition-colors"
                    >
                      <span className="tabular-nums text-slate-300 mr-1.5">{i + 1}</span>
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <article className="min-w-0 max-w-2xl">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-24 mb-10 last:mb-0">
                <h2 className="text-lg font-bold text-slate-900 mb-3 flex gap-3">
                  <span className="text-brand-300 tabular-nums font-mono text-sm pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-balance">{s.heading}</span>
                </h2>
                <div className="policy-body text-[15px] leading-relaxed text-slate-600 space-y-3 pl-0 sm:pl-9">
                  {s.body}
                </div>
              </section>
            ))}

            <aside className="mt-14 rounded-2xl bg-slate-50 border border-slate-200 p-6">
              <h2 className="text-sm font-bold text-slate-900">Questions about this policy?</h2>
              <p className="text-sm text-slate-600 mt-1.5">
                Our team answers support and booking enquiries around the clock.
              </p>
              <div className="mt-4 flex flex-col gap-2.5 text-sm">
                <a
                  href={`tel:${CONTACT.phoneE164}`}
                  className="flex items-center gap-2 font-semibold text-brand-700 hover:text-brand-800 transition-colors"
                >
                  <Phone size={15} className="shrink-0" />
                  {CONTACT.phone}
                </a>
                <a
                  href={`mailto:${CONTACT.supportEmail}`}
                  className="flex items-center gap-2 font-semibold text-brand-700 hover:text-brand-800 transition-colors"
                >
                  <Mail size={15} className="shrink-0" />
                  {CONTACT.supportEmail}
                </a>
                <span className="flex items-center gap-2 text-slate-500">
                  <MapPin size={15} className="shrink-0" />
                  {CONTACT.address}
                </span>
              </div>
            </aside>
          </article>
        </div>
      </div>
    </main>
  );
}

/** A labelled list of terms — used for definitions and fee tables. */
export function DefList({ items }: { items: { term: string; detail: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-slate-100 border-y border-slate-100 my-4">
      {items.map((it) => (
        <div key={it.term} className="py-3 sm:grid sm:grid-cols-[160px_1fr] sm:gap-4">
          <dt className="font-semibold text-slate-800 text-sm">{it.term}</dt>
          <dd className="text-slate-600 text-[15px] mt-1 sm:mt-0">{it.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Bulleted points inside a policy section. */
export function Points({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 marker:text-slate-300">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
