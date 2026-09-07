import type { IRoom, IRoomOption, PricingMode } from "@/lib/models/Room";

/**
 * A room as the booking flow wants to see it: one base price, one set of
 * policies that price buys, and a list of extras a guest can add one by one.
 *
 * Rooms written before the model changed still carry `ratePlans` — several
 * mutually exclusive prices for the same room. Those are folded into this shape
 * on read, so nothing has to be migrated before checkout works.
 */
export interface ResolvedRoom {
  basePrice: number;
  pricingMode: PricingMode;
  breakfast: boolean;
  refundable: boolean;
  cancellationHours: number;
  options: IRoomOption[];
}

type RoomLike = Pick<
  IRoom,
  "basePrice" | "pricingMode" | "breakfast" | "refundable" | "cancellationHours" | "options" | "ratePlans"
>;

export function resolveRoom(room: RoomLike): ResolvedRoom {
  if (room.options?.length || !room.ratePlans?.length) {
    return {
      basePrice: room.basePrice,
      pricingMode: room.pricingMode ?? "per_room",
      breakfast: room.breakfast ?? false,
      refundable: room.refundable ?? true,
      cancellationHours: room.cancellationHours ?? 24,
      options: room.options ?? [],
    };
  }
  return fromRatePlans(room);
}

/**
 * The cheapest legacy plan becomes the base price; what the dearer plans added
 * becomes an extra. Breakfast is priced net of any cancellation premium the same
 * plan also carried, so ticking both lands on the old combined price rather than
 * charging the flexibility twice.
 */
function fromRatePlans(room: RoomLike): ResolvedRoom {
  const sorted = [...room.ratePlans].sort((a, b) => a.priceDelta - b.priceDelta);
  const base = sorted[0];
  const options: IRoomOption[] = [];

  const flexPlan = base.refundable ? undefined : sorted.find((p) => p.refundable);
  const flexPremium = flexPlan ? Math.max(0, flexPlan.priceDelta - base.priceDelta) : 0;

  if (flexPlan) {
    options.push({
      code: "free-cancellation",
      label: "Free cancellation",
      description: `Cancel up to ${flexPlan.cancellationHours || 24}h before check-in for a full refund.`,
      price: flexPremium,
      per: "night",
      breakfast: false,
      refundable: true,
      cancellationHours: flexPlan.cancellationHours || 24,
    });
  }

  const breakfastPlan = base.breakfast ? undefined : sorted.find((p) => p.breakfast);
  if (breakfastPlan) {
    const gross = Math.max(0, breakfastPlan.priceDelta - base.priceDelta);
    options.push({
      code: "breakfast",
      label: "Breakfast",
      description: "Breakfast for the room, every morning of the stay.",
      price: Math.max(0, gross - (breakfastPlan.refundable ? flexPremium : 0)),
      per: "night",
      breakfast: true,
      refundable: false,
      cancellationHours: 0,
    });
  }

  return {
    basePrice: room.basePrice + base.priceDelta,
    pricingMode: room.pricingMode ?? "per_room",
    breakfast: base.breakfast,
    refundable: base.refundable,
    cancellationHours: base.cancellationHours,
    options,
  };
}

/**
 * How many times the nightly rate is charged for occupancy. One for a room sold
 * per room — which is the default — and the guest count when a vendor has opted
 * into charging per person.
 */
export function occupancyFor(mode: PricingMode, guests: number): number {
  return mode === "per_person" ? Math.max(1, Math.round(guests)) : 1;
}

/** The extras a guest actually ticked, in the order the vendor listed them. */
export function pickOptions(resolved: ResolvedRoom, codes: string[]): IRoomOption[] {
  const wanted = new Set(codes);
  return resolved.options.filter((o) => wanted.has(o.code));
}

/** What the base price plus the chosen extras buys, for the booking snapshot. */
export function policyWith(
  resolved: ResolvedRoom,
  options: IRoomOption[],
): { breakfast: boolean; refundable: boolean; cancellationHours: number } {
  const breakfast = resolved.breakfast || options.some((o) => o.breakfast);
  const flexible = options.filter((o) => o.refundable);
  const refundable = resolved.refundable || flexible.length > 0;
  const cancellationHours = resolved.refundable
    ? resolved.cancellationHours
    : Math.max(0, ...flexible.map((o) => o.cancellationHours), 0);
  return { breakfast, refundable, cancellationHours };
}

/** A short human label for what was booked, e.g. "Room only · Breakfast". */
export function describeSelection(resolved: ResolvedRoom, options: IRoomOption[]): string {
  const parts = [resolved.breakfast ? "Bed & breakfast" : "Room only", ...options.map((o) => o.label)];
  return parts.join(" · ");
}
