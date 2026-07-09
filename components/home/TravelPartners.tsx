import Image from "next/image";
import { partners } from "@/lib/mock-data";

export default function TravelPartners() {
  const loopPartners = [...partners, ...partners, ...partners, ...partners];

  return (
    <section className="py-12 bg-slate-50 border-y border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-slate-500 text-sm font-medium mb-8">
          Trusted by leading airlines and travel partners
        </p>
      </div>
      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div className="flex items-center gap-16 lg:gap-20 w-max animate-marquee-rtl">
          {loopPartners.map((partner, i) => (
            <div
              key={`${partner.id}-${i}`}
              className="shrink-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={150}
                height={60}
                className="h-4 sm:h-4 lg:h-8 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
