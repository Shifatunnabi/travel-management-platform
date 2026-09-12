/*
 * NOTE FOR MAINTAINERS: this is an accurate description of what the platform
 * actually collects and stores, written from the models and services in this
 * repo. It has not been reviewed by a lawyer. Have counsel check it before
 * treating it as the company's binding privacy notice, and re-check it whenever
 * a new processor or data field is introduced.
 */
import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage, { DefList, Points } from "@/components/legal/PolicyPage";
import { CONTACT } from "@/lib/config/contact";

export const metadata: Metadata = {
  title: "Privacy Policy · Tofiza",
  description:
    "What Tofiza Tours & Travels collects when you book, why we hold it, who we share it with, and how to have it corrected or removed.",
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      summary="What we collect when you book with Tofiza, why we hold it, who else sees it, and what you can ask us to do with it."
      effective="13 September 2026"
      sections={[
        {
          id: "who-we-are",
          heading: "Who we are",
          body: (
            <>
              <p>
                Tofiza Tours &amp; Travels (“Tofiza”, “we”) operates the booking platform at
                tofiza.com from {CONTACT.address}. We are the data controller for the information
                described here. For anything in this policy, write to{" "}
                <a href={`mailto:${CONTACT.supportEmail}`} className="text-brand-700 font-semibold hover:underline">
                  {CONTACT.supportEmail}
                </a>{" "}
                or call {CONTACT.phone}.
              </p>
              <p>
                Tofiza is a marketplace. Hotels and other travel providers list their own properties
                and rates, and when you complete a booking we pass your details to that provider so
                they can honour your stay. They handle your information under their own policies.
              </p>
            </>
          ),
        },
        {
          id: "what-we-collect",
          heading: "What we collect",
          body: (
            <>
              <p>We only collect what a booking actually needs.</p>
              <DefList
                items={[
                  {
                    term: "Your account",
                    detail:
                      "Name, email address and — if you give it — a phone number. Your password is stored only as a one-way bcrypt hash; we never hold it in a readable form and cannot tell you what it is.",
                  },
                  {
                    term: "A booking",
                    detail:
                      "The lead guest’s full name, email and phone number, any special requests you type, your dates, the number of guests and rooms, and the property and room you chose.",
                  },
                  {
                    term: "A payment",
                    detail:
                      "The transaction reference, amount, currency, the card scheme (for example VISA) and the issuing bank, returned to us by the payment gateway. We never see or store your full card number, expiry date or CVV — those are entered on the gateway’s own page, not ours.",
                  },
                  {
                    term: "Reviews",
                    detail:
                      "If you review a stay, the rating and text you write, shown publicly with your display name and trip type.",
                  },
                  {
                    term: "Property partners",
                    detail:
                      "Businesses listing with us additionally provide company details and bank account details for disbursement of their earnings.",
                  },
                ]}
              />
              <p>
                We do not ask for your national ID, passport number or date of birth to book a
                hotel, and we do not buy personal data from third parties.
              </p>
            </>
          ),
        },
        {
          id: "why",
          heading: "Why we hold it",
          body: (
            <Points
              items={[
                "To create and confirm your booking, and to give the property the details it needs to receive you.",
                "To take payment and, where a refund is due, to return it to the same payment method.",
                "To send you transactional email — your invoice and voucher, cancellation notices, email verification and password resets.",
                "To let you sign in, see your bookings and cancel them.",
                "To keep the platform honest: detecting fraudulent bookings, and keeping the financial records the law requires us to keep.",
                "To answer you when you contact support.",
              ]}
            />
          ),
        },
        {
          id: "sharing",
          heading: "Who else sees it",
          body: (
            <>
              <p>
                We do not sell your personal information, and we do not share it for anyone else’s
                marketing. It reaches only these parties, and only as far as each one needs:
              </p>
              <DefList
                items={[
                  {
                    term: "The property",
                    detail:
                      "The hotel or partner you booked receives the lead guest’s name, contact details, stay dates, room and any special requests, so they can hold your room.",
                  },
                  {
                    term: "SSLCommerz",
                    detail:
                      "Our payment gateway. You enter your card or mobile wallet details directly with them; they confirm the result to us.",
                  },
                  {
                    term: "Cloudinary",
                    detail: "Stores and serves the images shown on the site.",
                  },
                  {
                    term: "Our email provider",
                    detail: "Delivers the transactional email described above.",
                  },
                  {
                    term: "Our database host",
                    detail: "Stores the platform’s records on our behalf.",
                  },
                ]}
              />
              <p>
                We will also disclose information where a law, a regulator or a court validly
                requires it.
              </p>
            </>
          ),
        },
        {
          id: "retention",
          heading: "How long we keep it",
          body: (
            <>
              <p>
                Booking, payment and invoice records are kept for as long as accounting and tax rules
                in Bangladesh require, because they are financial records — closing your account does
                not erase them.
              </p>
              <p>
                Everything else — your profile, saved preferences and unbooked activity — is removed
                when you close your account or ask us to delete it. Unpaid checkouts that were never
                completed expire on their own and are cleared automatically.
              </p>
            </>
          ),
        },
        {
          id: "your-rights",
          heading: "What you can ask us to do",
          body: (
            <>
              <p>You can ask us at any time to:</p>
              <Points
                items={[
                  "Show you the personal information we hold about you.",
                  "Correct anything that is wrong — you can edit most of it yourself under your account profile.",
                  "Delete your account and the information that is not a financial record we must retain.",
                  "Stop sending you marketing email. Every marketing message has an unsubscribe link; booking confirmations and invoices are not marketing and will still be sent.",
                ]}
              />
              <p>
                Email{" "}
                <a href={`mailto:${CONTACT.supportEmail}`} className="text-brand-700 font-semibold hover:underline">
                  {CONTACT.supportEmail}
                </a>{" "}
                and we will respond within 30 days. We may ask you to confirm your identity first, so
                that nobody else can make these requests about you.
              </p>
            </>
          ),
        },
        {
          id: "security",
          heading: "How we protect it",
          body: (
            <>
              <p>
                The site is served over HTTPS. Passwords are hashed with bcrypt and are never
                returned by our own queries. Card details never touch our servers. Access to booking
                and customer records is limited to the property you booked with and to Tofiza staff
                who need it, and privileged staff actions are written to an internal audit log.
              </p>
              <p>
                No system is perfect. If a breach ever affects your information, we will tell you and
                the relevant authority without undue delay.
              </p>
            </>
          ),
        },
        {
          id: "cookies-children-changes",
          heading: "Cookies, children and changes",
          body: (
            <>
              <p>
                Cookies are covered separately in our{" "}
                <Link href="/cookies" className="text-brand-700 font-semibold hover:underline">
                  Cookie Policy
                </Link>
                .
              </p>
              <p>
                Tofiza is not intended for children under 18, and we do not knowingly create accounts
                for them. Children can of course be named as guests on a booking made by an adult.
              </p>
              <p>
                If we change this policy we will update the effective date above, and tell account
                holders by email where the change is significant.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
