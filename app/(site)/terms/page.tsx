/*
 * NOTE FOR MAINTAINERS: written to match how the booking flow, pricing and
 * cancellation logic in this repo actually behave. Not reviewed by a lawyer —
 * have counsel check it before relying on it, and keep the hold window,
 * commission and settlement figures in step with lib/models/Settings.ts.
 */
import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage, { DefList, Points } from "@/components/legal/PolicyPage";
import { CONTACT } from "@/lib/config/contact";

export const metadata: Metadata = {
  title: "Terms of Service · Tofiza",
  description:
    "The agreement between you and Tofiza Tours & Travels when you book a stay: how bookings are made, what you pay, and who is responsible for what.",
};

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms of Service"
      summary="The agreement between you and Tofiza when you use this site to book travel. By making a booking you accept these terms."
      effective="13 September 2026"
      sections={[
        {
          id: "role",
          heading: "What Tofiza does",
          body: (
            <>
              <p>
                Tofiza is a booking platform. We list properties on behalf of the hotels and partners
                who own them, take your payment, and pass the booking to the provider. The stay
                itself is supplied by that provider, not by us.
              </p>
              <p>
                This means two contracts exist: one between you and Tofiza for the booking service,
                and one between you and the property for the stay. Descriptions, photographs,
                amenities and house rules are supplied by the property. We check listings before
                publishing them, but we cannot guarantee that every detail is current.
              </p>
            </>
          ),
        },
        {
          id: "account",
          heading: "Your account",
          body: (
            <>
              <p>
                You must be 18 or over to hold an account and to make a booking. Keep your password
                to yourself — anything done through your account is treated as done by you. Tell us
                at once if you think someone else has access.
              </p>
              <p>
                Give accurate details. If the lead guest’s name or contact details are wrong, the
                property may refuse check-in, and we cannot refund a booking that fails for that
                reason.
              </p>
            </>
          ),
        },
        {
          id: "booking",
          heading: "Making a booking",
          body: (
            <>
              <p>A booking goes through three steps, and only the last one secures the room:</p>
              <DefList
                items={[
                  {
                    term: "1 · Room held",
                    detail:
                      "Choosing a room holds it for a short window — 15 minutes by default — while you enter guest details and pay. The nightly rates are frozen at this point, so a price change cannot move what you are charged. If you do not pay within the window, the hold expires and the room returns to sale.",
                  },
                  {
                    term: "2 · Payment",
                    detail:
                      "You pay on SSLCommerz’s secure page. We verify the result directly with the gateway before confirming anything — landing back on our site is not by itself proof of payment.",
                  },
                  {
                    term: "3 · Confirmed",
                    detail:
                      "Once the gateway confirms, your booking is confirmed, the property is notified, and we email you an invoice carrying your booking reference. Present that reference at check-in.",
                  },
                ]}
              />
              <p>
                If payment fails or you abandon the page, nothing is charged and the room is
                released. You are free to try again.
              </p>
            </>
          ),
        },
        {
          id: "prices",
          heading: "Prices and what they include",
          body: (
            <>
              <p>
                Prices are shown in Bangladeshi Taka (৳). The total shown before you pay is the total
                you are charged — it already includes taxes, any service fee and any extras you
                ticked, less any discount code applied.
              </p>
              <Points
                items={[
                  "The room rate is set by the property and can differ by date. What you see for your chosen dates is what applies.",
                  "Extras such as breakfast, an airport transfer or a flexible cancellation option are optional and are added on top of the room price.",
                  "Anything you buy directly from the property during your stay — meals, minibar, late checkout arranged on arrival — is settled with them, not with us.",
                  "Discount codes have their own conditions, including minimum spend, validity window and usage limits, shown when you apply the code.",
                ]}
              />
              <p>
                If a price is listed in obvious error — a clear mispricing rather than a genuine
                offer — we may cancel the booking and refund you in full rather than honour it.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          heading: "Changes, cancellations and no-shows",
          body: (
            <>
              <p>
                What you get back depends on the rate you booked. Full detail is in our{" "}
                <Link href="/refunds" className="text-brand-700 font-semibold hover:underline">
                  Refund Policy
                </Link>{" "}
                and{" "}
                <Link href="/fare-rules" className="text-brand-700 font-semibold hover:underline">
                  Rate Rules
                </Link>
                . In short: refundable rates are refunded in full if you cancel before that rate’s
                cut-off; non-refundable rates are not refunded. Not turning up is treated as a
                cancellation with no notice.
              </p>
              <p>
                Cancel from your account under Manage Booking. If a property cancels on you — an
                overbooking, or something outside their control — we will refund you in full or help
                you find a comparable alternative.
              </p>
            </>
          ),
        },
        {
          id: "conduct",
          heading: "Using the site properly",
          body: (
            <>
              <p>Do not:</p>
              <Points
                items={[
                  "Make speculative, false or fraudulent bookings, or bookings in someone else’s name without their authority.",
                  "Scrape, resell or republish our listings, rates or content.",
                  "Interfere with the site, attempt to access accounts or data that are not yours, or test its security without our written permission.",
                  "Post a review that is untruthful, abusive, or about a stay you did not take. We moderate reviews and remove ones that break this.",
                ]}
              />
              <p>We may suspend or close an account that does any of these.</p>
            </>
          ),
        },
        {
          id: "partners",
          heading: "If you list a property",
          body: (
            <>
              <p>
                Partners are subject to these terms and to the agreement accepted during onboarding.
                In summary: you must have the right to sell the rooms you list, keep rates and
                availability accurate, and honour every booking we confirm at the price confirmed.
              </p>
              <p>
                Tofiza deducts a commission from each confirmed booking, set in your partner
                agreement and shown on every transaction in your dashboard. Your earnings become
                withdrawable a settlement window after the guest checks out, and are paid to the
                verified bank account on your account.
              </p>
            </>
          ),
        },
        {
          id: "liability",
          heading: "Our responsibility, and its limits",
          body: (
            <>
              <p>
                We are responsible for running the booking service with reasonable care — taking your
                payment correctly, passing your booking to the property, and putting right any error
                that is ours.
              </p>
              <p>
                We are not responsible for the property’s own acts: the condition of the room, the
                standard of service, or anything that happens during your stay. Nor are we
                responsible for events outside anyone’s reasonable control, such as weather, strikes
                or civil disruption.
              </p>
              <p>
                Where we are liable, our liability is limited to the amount you paid for the booking
                in question. Nothing here limits liability that cannot be limited by law.
              </p>
            </>
          ),
        },
        {
          id: "law",
          heading: "Governing law and changes",
          body: (
            <>
              <p>
                These terms are governed by the law of Bangladesh, and the courts of Bangladesh have
                jurisdiction over any dispute.
              </p>
              <p>
                We may update these terms. The version in force for your booking is the one published
                when you made it, and the effective date above tells you which that is. Questions go
                to{" "}
                <a href={`mailto:${CONTACT.supportEmail}`} className="text-brand-700 font-semibold hover:underline">
                  {CONTACT.supportEmail}
                </a>{" "}
                or {CONTACT.phone}.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
