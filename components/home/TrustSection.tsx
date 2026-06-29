import { Shield, CheckCircle, Zap, Tag, Headphones, RefreshCw } from "lucide-react";
import { trustFeatures } from "@/lib/mock-data";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "shield-check": Shield,
  "verified": CheckCircle,
  "zap": Zap,
  "tag": Tag,
  "headphones": Headphones,
  "refresh": RefreshCw,
};

const statsData = [
  { value: "500K+", label: "Happy Travelers" },
  { value: "1,200+", label: "Destinations" },
  { value: "50+", label: "Airline Partners" },
  { value: "4.9★", label: "App Rating" },
];

export default function TrustSection() {
  return (
    <section className="py-16 lg:py-24 bg-blue-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 pb-16 border-b border-blue-600">
          {statsData.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold text-white">{stat.value}</p>
              <p className="text-blue-200 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-2">
            Why Choose Tofiza
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Travel with confidence
          </h2>
          <p className="text-blue-200 mt-3 text-base max-w-xl mx-auto">
            We're committed to making every journey safe, affordable, and unforgettable
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustFeatures.map((feature) => {
            const Icon = iconMap[feature.icon] || Shield;
            return (
              <div
                key={feature.title}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 hover:bg-white/15 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-white font-bold text-base mb-2">{feature.title}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
