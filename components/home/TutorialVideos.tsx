"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";

interface TutorialVideo {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
}

const tutorialVideos: TutorialVideo[] = [
  {
    id: "tut-001",
    title: "How to book a flight in 3 minutes",
    description: "A quick walkthrough of searching, selecting, and booking your flight on Tofiza.",
    youtubeId: "aqz-KE-bpKQ",
  },
  {
    id: "tut-002",
    title: "Finding the best hotel deals",
    description: "Learn how to filter and compare hotels to get the best price for your stay.",
    youtubeId: "ysz5S6PUM-U",
  },
  {
    id: "tut-003",
    title: "Managing your bookings",
    description: "See how to view, modify, or cancel your bookings from your Tofiza dashboard.",
    youtubeId: "M7lc1UVf-VE",
  },
  {
    id: "tut-004",
    title: "Applying coupon codes at checkout",
    description: "Save more on your next trip by learning how to apply promo codes correctly.",
    youtubeId: "9bZkp7q19f0",
  },
  {
    id: "tut-005",
    title: "Setting up your traveler profile",
    description: "Speed up future bookings by saving passenger and passport details in advance.",
    youtubeId: "kJQP7kiw5Fk",
  },
];

export default function TutorialVideos() {
  const [current, setCurrent] = useState(0);
  const canScroll = tutorialVideos.length > 3;

  const prev = () => setCurrent((c) => (c - 1 + tutorialVideos.length) % tutorialVideos.length);
  const next = () => setCurrent((c) => (c + 1) % tutorialVideos.length);

  const visible = [
    tutorialVideos[current],
    tutorialVideos[(current + 1) % tutorialVideos.length],
    tutorialVideos[(current + 2) % tutorialVideos.length],
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">
              Watch & Learn
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 flex items-center gap-2">
              <PlayCircle size={30} className="text-brand-600" />
              Tofiza Tutorials
            </h2>
            <p className="text-slate-500 mt-2 text-base">
              Short videos to help you get the most out of Tofiza
            </p>
          </div>
          {canScroll && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-slate-300 hover:border-brand-500 hover:bg-brand-50 flex items-center justify-center text-slate-500 hover:text-brand-600 transition-all"
                aria-label="Previous videos"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-slate-300 hover:border-brand-500 hover:bg-brand-50 flex items-center justify-center text-slate-500 hover:text-brand-600 transition-all"
                aria-label="Next videos"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {visible.map((video, idx) => (
            <div
              key={`${video.id}-${idx}`}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300"
            >
              <div className="aspect-video w-full bg-slate-100">
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  title={video.title}
                  className="w-full h-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-slate-900 text-base mb-1.5">{video.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{video.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile arrows */}
        {canScroll && (
          <div className="flex sm:hidden items-center justify-center gap-3 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-slate-300 hover:border-brand-500 hover:bg-brand-50 flex items-center justify-center text-slate-500 hover:text-brand-600 transition-all"
              aria-label="Previous videos"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-slate-300 hover:border-brand-500 hover:bg-brand-50 flex items-center justify-center text-slate-500 hover:text-brand-600 transition-all"
              aria-label="Next videos"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
