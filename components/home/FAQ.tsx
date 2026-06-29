"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { faqs } from "@/lib/mock-data";

export default function FAQ() {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id);

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">
            Got Questions?
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
            Frequently asked questions
          </h2>
          <p className="text-slate-500 mt-3 text-base">
            Everything you need to know about Tofiza. Can't find an answer?{" "}
            <a href="/contact" className="text-blue-600 hover:underline font-medium">
              Contact us
            </a>
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = open === faq.id;
            return (
              <div
                key={faq.id}
                className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                  isOpen ? "border-blue-200 shadow-sm" : "border-slate-200"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`font-semibold text-sm leading-snug pr-4 ${
                      isOpen ? "text-blue-700" : "text-slate-800"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <span className="shrink-0">
                    {isOpen ? (
                      <ChevronUp size={18} className="text-blue-500" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-400" />
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
