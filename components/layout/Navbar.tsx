"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, Phone, User } from "lucide-react";
import Button from "@/components/ui/Button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/flights/search", label: "Flights" },
  { href: "/hotels/search", label: "Hotels" },
];

export default function Navbar({
  account,
  mobileAccount,
}: {
  /** Server-rendered account control, streamed in its own boundary. */
  account?: React.ReactNode;
  mobileAccount?: React.ReactNode;
} = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Over the hero the bar itself is transparent; the white haze comes from the
  // taller gradient layer below, which fades out *under* the content instead of
  // across it. Once scrolled it hands over to a solid white bar.
  const navBg =
    isHome && !scrolled
      ? "bg-white shadow-navbar lg:bg-transparent lg:shadow-none"
      : "bg-white shadow-navbar";
  const heroHaze = isHome && !scrolled ? "opacity-100" : "opacity-0";

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg}`}
      >
        {/* Twice the bar's height, so the content sits in the dense top half and
            the haze dissolves into the hero below it. */}
        <div
          aria-hidden="true"
          className={`hidden lg:block absolute inset-x-0 top-0 h-16 lg:h-20 -z-10 pointer-events-none bg-gradient-to-b from-white/80 via-white/50 to-transparent backdrop-blur-sm transition-opacity duration-300 ${heroHaze}`}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/asset/tofiza.png"
                alt="Tofiza Tours & Travels"
                width={306}
                height={90}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-brand-600 text-white"
                      : "text-slate-800 hover:text-brand-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="tel:+8801700000000"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-800 hover:text-brand-600 transition-colors"
              >
                <Phone size={15} />
                <span>Support</span>
              </a>
              {account ?? (
                <>
                  <Link href="/auth/login">
                    <Button variant="secondary" size="sm">
                      <User size={15} />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" variant="primary">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 shrink-0 rounded-xl bg-brand text-white flex items-center justify-center shadow-sm transition-opacity hover:opacity-90 active:opacity-80"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X size={20} />
              ) : (
                <span className="flex flex-col gap-[4px]" aria-hidden="true">
                  <span className="block w-[18px] h-[2px] rounded-full bg-current" />
                  <span className="block w-[18px] h-[2px] rounded-full bg-current" />
                  <span className="block w-[18px] h-[2px] rounded-full bg-current" />
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-200 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        style={{ background: "rgba(0,0,0,0.4)" }}
      />

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <Image src="/asset/tofiza.png" alt="Tofiza Tours & Travels" width={272} height={80} className="h-8 w-auto object-contain" />
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="px-4 pt-4 pb-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-brand-600 text-white"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-100 px-4 py-5 space-y-3">
          {mobileAccount ?? (
            <>
              <Link href="/auth/login" className="block">
                <Button variant="outline" fullWidth size="md">
                  <User size={16} />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register" className="block">
                <Button variant="primary" fullWidth size="md">
                  Create Account
                </Button>
              </Link>
            </>
          )}
          <a
            href="tel:+8801700000000"
            className="flex items-center gap-2 text-sm text-slate-600 px-2 pt-2"
          >
            <Phone size={15} className="text-brand-600" />
            <span>+880 1700-000000 (24/7)</span>
          </a>
        </div>
      </div>
    </>
  );
}
