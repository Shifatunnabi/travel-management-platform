"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Manage Booking", href: "/dashboard/bookings" },
    { label: "Refunds", href: "/refunds" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Fare Rules", href: "/fare-rules" },
  ],
};

const paymentMethods = [
  { name: "Visa", bg: "bg-blue-600", text: "Visa" },
  { name: "Mastercard", bg: "bg-red-500", text: "MC" },
  { name: "bKash", bg: "bg-pink-600", text: "bKash" },
  { name: "Nagad", bg: "bg-orange-500", text: "Nagad" },
  { name: "DBBL", bg: "bg-purple-600", text: "DBBL" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Newsletter strip */}
      <div className="bg-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-xl font-bold">Get exclusive travel deals</h3>
              <p className="text-blue-200 text-sm mt-1">
                Subscribe and receive the best offers directly in your inbox
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full max-w-md gap-2"
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-white text-blue-700 font-semibold text-sm rounded-xl hover:bg-blue-50 transition-colors shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand col */}
          <div className="lg:col-span-2 space-y-5">
            <Image
              src="/logo.png"
              alt="Tofiza"
              width={130}
              height={36}
              className="h-9 w-auto brightness-0 invert"
            />
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Tofiza is your premium travel companion for booking flights and
              hotels across Bangladesh and beyond. Experience travel the way it
              should be — simple, affordable, and memorable.
            </p>
            <div className="space-y-2">
              <a
                href="tel:+8801700000000"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Phone size={14} className="text-blue-400 shrink-0" />
                +880 1700-000000 (24/7)
              </a>
              <a
                href="mailto:support@tofiza.com"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Mail size={14} className="text-blue-400 shrink-0" />
                support@tofiza.com
              </a>
              <span className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-blue-400 shrink-0" />
                Gulshan, Dhaka 1212, Bangladesh
              </span>
            </div>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { label: "f", href: "#", name: "Facebook" },
                { label: "𝕏", href: "#", name: "Twitter" },
                { label: "in", href: "#", name: "Instagram" },
                { label: "▶", href: "#", name: "YouTube" },
              ].map(({ label, href, name }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors text-sm font-bold"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* App download */}
            <div className="mt-6 space-y-2">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Download App</p>
              {["App Store", "Google Play"].map((store) => (
                <a
                  key={store}
                  href="#"
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <span>📱</span> {store}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} Tofiza. All rights reserved. Registered in Bangladesh.
            </p>
            {/* Payment methods */}
            <div className="flex items-center gap-2">
              <span className="text-slate-600 text-xs mr-1">We accept:</span>
              {paymentMethods.map((pm) => (
                <span
                  key={pm.name}
                  className={`${pm.bg} text-white text-xs font-bold px-2 py-1 rounded`}
                  title={pm.name}
                >
                  {pm.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
