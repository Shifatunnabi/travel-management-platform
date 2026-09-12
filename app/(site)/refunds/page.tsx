/*
 * NOTE FOR MAINTAINERS: the rules below mirror `refundFor()` and
 * `cancelBooking()` in lib/services/booking-flow.ts — refundable rates refund
 * in full inside the cut-off and nothing outside it, and a platform admin can
 * override the amount. Keep this page and that function in step. Not reviewed
 * by a lawyer.
 */
import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage, { DefList, Points } from "@/components/legal/PolicyPage";
import { CONTACT } from "@/lib/config/contact";

export const metadata: Metadata = {
  title: "Refund Policy · Tofiza",
  description:
    "When a Tofiza booking is refundable, how much comes back, how long it takes, and how to cancel a stay.",
};

export default function RefundsPage() {
  return (
    <PolicyPage
      title="Refund Policy"
      summary="Whether you get money back depends on the rate you booked and how far ahead you cancel. This page tells you exactly which applies to you."
      effective="13 September 2026"
      sections={[
        {
          id: "rate-decides",
          heading: "Your rate decides your refund",
          body: (
            <>
              <p>
                Every room on Tofiza is sold on one of two bases, shown on the room before you book
                and again on your invoice.
              </p>
              <DefList
                items={[
                  {
                    term: "Refundable",
                    detail:
                      "Cancel before the cut-off shown on the room — commonly 24 hours before check-in — and you are refunded in full, including taxes and fees. Cancel after the cut-off, and no refund is due.",
                  },
                  {
                    term: "Non-refundable",
                    detail:
                      "Cheaper in exchange for certainty for the property. No refund is due if you cancel, at any point after booking.",
                  },
                ]}
              />
              <p>
                Some rooms sell flexibility as an optional extra. If you ticked it, your booking is
                refundable on that extra’s terms even where the base rate was not — your confirmation
                email states which applies.
              </p>
            </>
          ),
        },
        {
          id: "how-much",
          heading: "How much comes back",
          body: (
            <>
              <p>
                Refunds on this platform are all-or-nothing rather than pro-rated. Inside the
                cancellation window you are refunded the full amount you paid — the room, every extra
                you added, taxes and any service fee. We do not keep a booking fee.
              </p>
              <p>
                Outside the window, and on non-refundable rates, the amount due is zero. You can
                still cancel the booking so the property knows not to expect you, but no money is
                returned.
              </p>
            </>
          ),
        },
        {
          id: "how-to",
          heading: "How to cancel",
          body: (
            <>
              <Points
                items={[
                  <>
                    Sign in and open{" "}
                    <Link href="/account/bookings" className="text-brand-700 font-semibold hover:underline">
                      Manage Booking
                    </Link>
                    .
                  </>,
                  "Find the booking and choose Cancel. Before you confirm, the page tells you exactly what will be refunded — check that figure first.",
                  "Confirm. We email you straight away with the cancellation and the refund amount.",
                ]}
              />
              <p>
                Cancelling with us is what counts. Telling the hotel directly does not cancel a
                booking made here, and may leave you charged. If you cannot reach your booking, call{" "}
                {CONTACT.phone} or email{" "}
                <a href={`mailto:${CONTACT.supportEmail}`} className="text-brand-700 font-semibold hover:underline">
                  {CONTACT.supportEmail}
                </a>{" "}
                with your booking reference.
              </p>
            </>
          ),
        },
        {
          id: "timing",
          heading: "When the money arrives",
          body: (
            <>
              <p>
                Refunds go back to the card or mobile wallet you paid with. We cannot send a refund
                to a different account — that is a rule of the payment gateway, not ours.
              </p>
              <p>
                We release the refund to the gateway as soon as you cancel. Expect it to appear
                within <strong>5 to 10 working days</strong>, depending on your bank. If it has not
                arrived after 10 working days, contact us with your booking reference and we will
                trace it.
              </p>
            </>
          ),
        },
        {
          id: "no-show",
          heading: "No-shows and shortened stays",
          body: (
            <p>
              Not arriving is treated as a cancellation with no notice, so the same rules apply —
              which on most rates means no refund. Checking out early is settled with the property
              directly; whether they refund unused nights is their decision, not ours.
            </p>
          ),
        },
        {
          id: "we-cancel",
          heading: "If the property or Tofiza cancels",
          body: (
            <>
              <p>
                If a property cannot honour your booking — an overbooking, a closure, damage to the
                room — you are refunded in full regardless of the rate you booked. Where you would
                rather still travel, we will help you find a comparable property for the same dates.
              </p>
              <p>
                The same applies if we cancel a booking ourselves, for example where a price was
                listed in obvious error. You get everything back.
              </p>
            </>
          ),
        },
        {
          id: "disputes",
          heading: "If something went wrong during your stay",
          body: (
            <>
              <p>
                Raise it with the property while you are there — most problems are fixed fastest on
                the spot, and a property cannot put right what it does not know about.
              </p>
              <p>
                If it is not resolved, contact us within 30 days of checking out with your booking
                reference and what happened. We will take it up with the property on your behalf. A
                refund in this situation is not automatic — it depends on what the property agrees or
                what we judge fair — but we will tell you the outcome either way.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
