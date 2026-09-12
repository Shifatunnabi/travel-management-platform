/**
 * The public contact details, in one place.
 *
 * These were previously typed out separately in the footer, the email footer
 * and the settings defaults, which is how the site ended up advertising a
 * placeholder phone number. Anything guest-facing reads them from here.
 */
export const CONTACT = {
  /** Handles both support and booking enquiries. */
  supportEmail: "support@tofiza.com",
  bookingEmail: "support@tofiza.com",
  /** As written locally. */
  phone: "01816166563",
  /** Dialable form, for `tel:` links. */
  phoneE164: "+8801816166563",
  address: "Gulshan, Dhaka 1212, Bangladesh",
} as const;

/**
 * Social profiles, by platform name.
 *
 * The footer renders an icon only for a platform listed here. These four
 * previously shipped as `href="#"` — four links that looked live and went
 * nowhere. Paste the real profile URL in and the icon comes back.
 */
export const SOCIAL_LINKS: Partial<Record<"Facebook" | "Instagram" | "TikTok" | "YouTube", string>> = {
  // Facebook: "https://facebook.com/tofiza",
  // Instagram: "https://instagram.com/tofiza",
  // TikTok: "https://tiktok.com/@tofiza",
  // YouTube: "https://youtube.com/@tofiza",
};
