import { cacheLife } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "./NewsletterForm";
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
    { label: "Manage Booking", href: "/account/bookings" },
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
  { name: "Visa", bg: "bg-brand-600", text: "Visa" },
  { name: "Mastercard", bg: "bg-red-500", text: "MC" },
  { name: "bKash", bg: "bg-pink-600", text: "bKash" },
  { name: "Nagad", bg: "bg-orange-500", text: "Nagad" },
  { name: "DBBL", bg: "bg-purple-600", text: "DBBL" },
];

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M16.6 5.82c-.9-.78-1.43-1.9-1.43-3.12h-3.09v12.4c0 1.43-1.16 2.6-2.6 2.6a2.6 2.6 0 0 1-2.6-2.6c0-1.71 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64a5.7 5.7 0 0 0 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.32 7.32 0 0 0 4.3 1.38V7.3c-1.06 0-2.32-.44-3.24-1.48Z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.51 3.5 12 3.5 12 3.5s-7.51 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.49 20.5 12 20.5 12 20.5s7.51 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.75 15.5v-7l6.5 3.5-6.5 3.5Z" />
    </svg>
  );
}

const socialLinks = [
  { name: "Facebook", href: "#", Icon: FacebookIcon, bg: "bg-[#1877F2] hover:bg-[#1877F2]" },
  { name: "Instagram", href: "#", Icon: InstagramIcon, bg: "bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]" },
  { name: "TikTok", href: "#", Icon: TikTokIcon, bg: "bg-black hover:bg-black" },
  { name: "YouTube", href: "#", Icon: YoutubeIcon, bg: "bg-[#FF0000] hover:bg-[#FF0000]" },
];

export default async function Footer() {
  "use cache";
  // Revalidates daily, so the year rolls over without a redeploy.
  cacheLife("days");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Newsletter strip */}
      <div className="bg-brand-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-xl font-bold">Get exclusive travel deals</h3>
              <p className="text-brand-200 text-sm mt-1">
                Subscribe and receive the best offers directly in your inbox
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand col */}
          <div className="lg:col-span-2 space-y-5">
            <Image
              src="/asset/tofiza.png"
              alt="Tofiza Tours & Travels"
              width={306}
              height={90}
              className="h-9 w-auto object-contain brightness-0 invert"
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
                <Phone size={14} className="text-brand-400 shrink-0" />
                +880 1700-000000 (24/7)
              </a>
              <a
                href="mailto:support@tofiza.com"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Mail size={14} className="text-brand-400 shrink-0" />
                support@tofiza.com
              </a>
              <span className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-brand-400 shrink-0" />
                Gulshan, Dhaka 1212, Bangladesh
              </span>
            </div>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map(({ name, href, Icon, bg }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center text-white transition-opacity hover:opacity-85`}
                >
                  <Icon />
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
              © {year} Tofiza. All rights reserved. Registered in Bangladesh.
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
