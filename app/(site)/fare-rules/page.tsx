/*
 * NOTE FOR MAINTAINERS: describes hotel rate mechanics as implemented in
 * lib/services/pricing.ts and room-pricing.ts — one base rate, additive extras,
 * rates frozen at hold. The flight section deliberately says "not yet on sale";
 * when FEATURES.flights is switched on, replace it with real airline fare rules.
 * Not reviewed by a lawyer.
 */
import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage, { DefList, Points } from "@/components/legal/PolicyPage";

export const metadata: Metadata = {
  title: "Rate Rules · Tofiza",
  description:
    "How Tofiza room rates are built: what the nightly price includes, how extras and taxes are added, and when a rate is locked in.",
};

export default function FareRulesPage() {
  return (
    <PolicyPage
      title="Rate Rules"
      summary="How a price on Tofiza is put together — what the nightly rate covers, what gets added, and the point at which the price stops moving."
      effective="13 September 2026"
      sections={[
        {
          id: "one-rate",
          heading: "One room, one rate",
          body: (
            <>
              <p>
                Each room has a single nightly rate rather than a ladder of confusing fare classes.
                Everything else a property offers — breakfast, a transfer, flexible cancellation — is
                an optional extra added on top of that rate, priced and labelled separately so you
                can see what each one costs.
              </p>
              <p>
                Most rooms are priced per room per night: the price is the same whether one person
                sleeps in it or two, up to the room’s stated occupancy. A small number of properties
                genuinely sell per guest, and those rooms are marked{" "}
                <span className="font-semibold text-slate-700">Priced per guest</span> so you can
                tell before you book.
              </p>
            </>
          ),
        },
        {
          id: "nightly",
          heading: "Rates vary by night",
          body: (
            <>
              <p>
                A property can set a different price for each date — weekends, holidays and peak
                season usually cost more. The figure shown on a room is the average across the nights
                you selected, and the total is the sum of the actual nightly rates, not the average
                multiplied out.
              </p>
              <p>
                This is why changing your dates by a day can change the price by more than you would
                expect. Some dates also carry a minimum stay set by the property; if your stay is
                shorter, the room will tell you rather than letting you book it.
              </p>
            </>
          ),
        },
        {
          id: "total",
          heading: "What makes up the total",
          body: (
            <>
              <p>In the order they are applied:</p>
              <DefList
                items={[
                  { term: "Room", detail: "Nightly rate × nights × number of rooms." },
                  {
                    term: "Extras",
                    detail:
                      "Anything you ticked. Some are charged per night of the stay, some once for the whole stay — each one says which.",
                  },
                  {
                    term: "Discount",
                    detail:
                      "Any valid code, applied before tax so the tax is calculated on what you actually pay. A discount can never exceed the value of the booking.",
                  },
                  { term: "Taxes", detail: "Applied to the discounted amount." },
                  { term: "Service fee", detail: "Added last, where one applies." },
                ]}
              />
              <p>
                The grand total shown before you pay is the amount charged to your card. There is
                nothing added afterwards, and the commission Tofiza earns comes out of the property’s
                share — it is never added to your bill.
              </p>
            </>
          ),
        },
        {
          id: "locked",
          heading: "When the price is locked in",
          body: (
            <>
              <p>
                Rates are frozen the moment you start checkout, and the room is held for you while
                you complete it — 15 minutes by default. If the property changes its prices during
                that window, your booking is unaffected.
              </p>
              <p>
                The freeze ends with the hold. If you let it expire and start again, you get whatever
                the current price is, which may be higher or lower.
              </p>
            </>
          ),
        },
        {
          id: "cancel-terms",
          heading: "Cancellation terms attached to a rate",
          body: (
            <>
              <p>
                Every rate is either refundable with a cut-off — commonly 24 hours before check-in —
                or non-refundable. Which one you are getting is shown on the room, on the checkout
                page and on your invoice.
              </p>
              <p>
                Where a room offers flexible cancellation as a paid extra, buying it makes the
                booking refundable on that extra’s terms. The full mechanics are in our{" "}
                <Link href="/refunds" className="text-brand-700 font-semibold hover:underline">
                  Refund Policy
                </Link>
                .
              </p>
            </>
          ),
        },
        {
          id: "codes",
          heading: "Discount codes",
          body: (
            <Points
              items={[
                "A code can be limited to certain properties, certain cities, or a single property’s own rooms.",
                "Codes carry a validity window, and may set a minimum spend and a maximum discount.",
                "A code may be limited in total redemptions and in how many times one customer can use it.",
                "Codes apply to the room total, not to extras, taxes or fees. One code per booking.",
              ]}
            />
          ),
        },
        {
          id: "flights",
          heading: "Flight fares",
          body: (
            <>
              <p>
                Flight booking is not yet on sale through Tofiza. Air fares carry their own
                conditions — fare class, baggage allowance, change and cancellation charges, and
                airline-set refund rules that differ from the hotel terms above.
              </p>
              <p>
                When flights go live, those rules will be published here in full, and shown on each
                fare before you pay. Until then, nothing on this site can be booked as a flight.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
