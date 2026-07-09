"use client";

import { useState } from "react";
import { Plane, Building2, FileText, Compass, Clock } from "lucide-react";
import FlightSearchForm from "./FlightSearchForm";
import HotelSearchForm from "./HotelSearchForm";

type Tab = "flight" | "hotel" | "visa" | "tours";

const tabs: { id: Tab; label: string; icon: typeof Plane }[] = [
  { id: "hotel", label: "Hotel", icon: Building2 },
  { id: "flight", label: "Flight", icon: Plane },
  { id: "visa", label: "Visa", icon: FileText },
  { id: "tours", label: "Tours", icon: Compass },
];

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState<Tab>("flight");
  const activeMeta = tabs.find((t) => t.id === activeTab)!;

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlays */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,30,80,0.65) 0%, rgba(10,30,80,0.45) 40%, rgba(10,30,80,0.55) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center pt-32 pb-16 gap-8">
        {/* Capsule tab selector */}
        <div className="flex items-center bg-white/15 backdrop-blur-md border border-white/25 rounded-full p-1.5 gap-1 shadow-xl flex-wrap justify-center">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTab === id
                  ? "bg-white text-blue-700 shadow-md"
                  : "text-white hover:bg-white/10"
              }`}
              aria-pressed={activeTab === id}
            >
              <Icon
                size={16}
                className={activeTab === id ? "text-blue-600" : "text-white"}
              />
              {label}
            </button>
          ))}
        </div>

        {/* Search / coming-soon card */}
        <div className="w-full bg-white rounded-2xl shadow-2xl overflow-visible">
          {activeTab === "flight" && <FlightSearchForm />}
          {activeTab === "hotel" && <HotelSearchForm />}
          {(activeTab === "visa" || activeTab === "tours") && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Clock size={26} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1.5">
                {activeMeta.label} booking is coming soon
              </h3>
              <p className="text-slate-500 text-sm max-w-sm">
                This feature is coming soon. In the meantime, book your flights and hotels with Tofiza.
              </p>
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-white/80 text-xs">
          {["✓ Instant Confirmation", "✓ Best Price Guarantee", "✓ Free Cancellation", "✓ 24/7 Support"].map(
            (badge) => (
              <span key={badge} className="font-medium">
                {badge}
              </span>
            )
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 animate-bounce z-10">
        <span className="text-xs">Scroll to explore</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 10.5l-5-5h10l-5 5z" />
        </svg>
      </div>
    </section>
  );
}
