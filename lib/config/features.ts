/**
 * Product switches for things that are built but not ready to sell.
 *
 * Keep these honest: a feature that is off must be unreachable, not merely
 * hidden. A screen a customer can still walk into is live, whatever a nav menu
 * says about it.
 */
export const FEATURES = {
  /**
   * Flight search and booking.
   *
   * Off. The flight screens are a prototype: the payment step charges a
   * hard-coded amount that ignores the fare chosen, never calls the gateway,
   * and lands on a page telling the customer their flight is confirmed and an
   * e-ticket has been emailed — none of which happens. Until real airline
   * fares and ticketing are wired up, /flights/* shows a coming-soon notice
   * and the Flight tab is a placeholder alongside Visa and Tours.
   */
  flights: false,
} as const;
