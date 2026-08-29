/**
 * Resolves the stay dates for a search. Falls back to tomorrow + 2 nights when
 * the URL has none, so a bare /hotels/search still shows real prices.
 */
export interface Stay {
  checkIn: string;
  checkOut: string;
  nights: number;
  checkInLabel: string;
  checkOutLabel: string;
}

const DAY = 86_400_000;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

function todayUTC(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function key(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function label(iso: string): string {
  return new Date(`${iso}T00:00:00.000Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function defaultStay(checkIn?: string, checkOut?: string): Stay {
  const today = todayUTC();
  const tomorrow = new Date(today.getTime() + DAY);

  let inDate = checkIn && ISO.test(checkIn) ? new Date(`${checkIn}T00:00:00.000Z`) : tomorrow;
  if (inDate < today) inDate = tomorrow;

  let outDate =
    checkOut && ISO.test(checkOut) ? new Date(`${checkOut}T00:00:00.000Z`) : new Date(inDate.getTime() + 2 * DAY);
  if (outDate <= inDate) outDate = new Date(inDate.getTime() + DAY);

  const nights = Math.round((outDate.getTime() - inDate.getTime()) / DAY);
  const ci = key(inDate);
  const co = key(outDate);

  return { checkIn: ci, checkOut: co, nights, checkInLabel: label(ci), checkOutLabel: label(co) };
}
