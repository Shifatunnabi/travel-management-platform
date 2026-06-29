"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "@/lib/mock-data";
import RatingStars from "@/components/ui/RatingStars";

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  const visible = [
    testimonials[current],
    testimonials[(current + 1) % testimonials.length],
    testimonials[(current + 2) % testimonials.length],
  ];

  return (
    <section className="py-16 lg:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">
              Traveler Stories
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              What our travelers say
            </h2>
            <p className="text-slate-500 mt-2 text-base">
              Real reviews from verified Tofiza customers
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-slate-300 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-slate-300 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {visible.map((t, idx) => (
            <div
              key={`${t.id}-${idx}`}
              className={`bg-white rounded-2xl border border-slate-100 p-6 shadow-sm transition-all duration-300 ${
                idx === 0 ? "ring-2 ring-blue-200" : "opacity-80"
              }`}
            >
              <Quote size={24} className="text-blue-200 mb-3" />
              <p className="text-slate-700 text-sm leading-relaxed mb-5 line-clamp-4">{t.review}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{t.name}</p>
                  <p className="text-slate-500 text-xs truncate">{t.location}</p>
                </div>
                <div className="shrink-0 text-right">
                  <RatingStars rating={t.rating} size="sm" />
                  <p className="text-xs text-slate-400 mt-0.5">{t.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-6 sm:hidden">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-6 bg-blue-600" : "w-1.5 bg-slate-300"
              }`}
              aria-label={`Go to ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
