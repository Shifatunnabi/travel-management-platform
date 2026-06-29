import Image from "next/image";
import { partners } from "@/lib/mock-data";

export default function TravelPartners() {
  return (
    <section className="py-12 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-slate-500 text-sm font-medium mb-8">
          Trusted by leading airlines and travel partners
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="transition-all duration-300 opacity-60 hover:opacity-100"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={300}
                height={120}
                className="h-8 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
