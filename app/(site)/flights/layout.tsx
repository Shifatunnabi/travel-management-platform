import type { Metadata } from "next";
import { FEATURES } from "@/lib/config/features";
import FlightsComingSoon from "@/components/flights/FlightsComingSoon";

export const metadata: Metadata = {
  title: "Flights · Tofiza",
  description:
    "Flight booking on Tofiza is not open yet. Hotels are live across Bangladesh and beyond.",
};

/**
 * Gate for every /flights route, nested ones included.
 *
 * Not rendering `children` is what makes this a gate rather than a banner: the
 * flight pages underneath never mount, so the prototype checkout — which takes
 * no payment and then reports a confirmed booking — cannot be reached by URL,
 * by a bookmark, or from a search result. One flag in lib/config/features.ts
 * brings it all back.
 */
export default function FlightsLayout({ children }: { children: React.ReactNode }) {
  if (!FEATURES.flights) return <FlightsComingSoon />;
  return <>{children}</>;
}
