import Link from "next/link";
import Image from "next/image";

/**
 * Static stand-in shown while the interactive navbar resolves. Matches the real
 * bar's height and solid-white treatment so nothing shifts when it swaps in.
 */
export default function NavbarFallback() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-white shadow-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Tofiza Tours &amp; Travels">
          <Image
            src="/asset/tofiza.png"
            alt="Tofiza Tours &amp; Travels"
            width={340}
            height={100}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>
        <nav className="hidden lg:flex items-center gap-8" aria-hidden="true">
          <span className="text-sm font-semibold text-slate-700">Home</span>
          <span className="text-sm font-semibold text-slate-700">Flights</span>
          <span className="text-sm font-semibold text-slate-700">Hotels</span>
        </nav>
      </div>
    </header>
  );
}
