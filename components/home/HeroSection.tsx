"use client";

import { useState } from "react";
import { Plane, Building2 } from "lucide-react";
import FlightSearchForm from "./FlightSearchForm";
import HotelSearchForm from "./HotelSearchForm";

type Tab = "flight" | "hotel";

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState<Tab>("flight");

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
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center pt-24 pb-16 gap-8">
        {/* Hero text */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-lg">
            Explore the World
            <span className="block text-blue-300">with Ease</span>
          </h1>
          <p className="text-blue-100 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed drop-shadow">
            Book flights and hotels at the best prices. Instant confirmation, 24/7 support.
          </p>
        </div>

        {/* Capsule tab selector */}
        <div className="flex items-center bg-white/15 backdrop-blur-md border border-white/25 rounded-full p-1.5 gap-1 shadow-xl">
          <button
            onClick={() => setActiveTab("flight")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeTab === "flight"
                ? "bg-white text-blue-700 shadow-md"
                : "text-white hover:bg-white/10"
            }`}
            aria-pressed={activeTab === "flight"}
          >
            <Plane
              size={16}
              className={activeTab === "flight" ? "text-blue-600" : "text-white"}
            />
            Book a Flight
          </button>
          <button
            onClick={() => setActiveTab("hotel")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeTab === "hotel"
                ? "bg-white text-blue-700 shadow-md"
                : "text-white hover:bg-white/10"
            }`}
            aria-pressed={activeTab === "hotel"}
          >
            <Building2
              size={16}
              className={activeTab === "hotel" ? "text-blue-600" : "text-white"}
            />
            Book a Hotel
          </button>
        </div>

        {/* Search card */}
        <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {activeTab === "flight" ? <FlightSearchForm /> : <HotelSearchForm />}
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
