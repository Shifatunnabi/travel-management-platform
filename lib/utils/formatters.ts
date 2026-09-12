export function formatCurrency(amount: number, currency = "BDT"): string {
  if (currency === "BDT") {
    return `৳${amount.toLocaleString("en-BD")}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

/**
 * The timezone the business runs in. Timestamps are instants, so they have to
 * be read somewhere — reading them wherever the server happens to sit puts a
 * Dhaka evening booking on the previous day.
 */
const TZ = "Asia/Dhaka";

/**
 * A calendar date — a check-in, a check-out, a coupon window. These are stored
 * at midnight UTC and mean a day, not an instant, so they are read back in UTC.
 * Reading them in a local zone is what shifts a stay a day either way.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * A real instant — when a payment was taken, when a booking was made. Shown in
 * Bangladesh time, with the clock time, because "which day" on its own is not
 * enough to reconcile a payment against a gateway statement.
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: TZ,
  });
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateBookingRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "TFZ";
  for (let i = 0; i < 7; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

export function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${Math.abs(days)} days ago`;
  return `In ${days} days`;
}

/**
 * Today's date as YYYY-MM-DD, or "" during server prerendering.
 *
 * Cache Components treats `new Date()` as non-deterministic and refuses to
 * prerender a component that calls it. These search forms only need "today" as
 * a lower bound on a date picker, which is a client-side concern — so we skip
 * it on the server and let the value arrive at hydration.
 */
export function todayISO(): string {
  if (typeof window === "undefined") return "";
  return toISODate(new Date());
}

/**
 * A Date's calendar day as YYYY-MM-DD, read from its *local* fields.
 *
 * `toISOString()` converts to UTC first, so a date built from a calendar cell —
 * which is local midnight — lands on the previous day for every zone ahead of
 * UTC. In Dhaka (UTC+6) that turned every date a guest picked into the day
 * before, both on screen and in the database.
 */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
