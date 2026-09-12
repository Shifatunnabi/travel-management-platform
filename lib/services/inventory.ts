import type { ClientSession } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { RoomInventory } from "@/lib/models/RoomInventory";
import { Room, type IRoom } from "@/lib/models/Room";

/** Midnight UTC for a YYYY-MM-DD string or Date. */
export function toNight(value: string | Date): Date {
  const d = typeof value === "string" ? new Date(`${value}T00:00:00.000Z`) : new Date(value);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function toDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/** Every night in [checkIn, checkOut) — the checkout day is not sold. */
export function nightsBetween(checkIn: Date, checkOut: Date): Date[] {
  const nights: Date[] = [];
  const cursor = toNight(checkIn);
  const end = toNight(checkOut);
  while (cursor < end) {
    nights.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return nights;
}

export function countNights(checkIn: Date, checkOut: Date): number {
  return Math.max(
    0,
    Math.round((toNight(checkOut).getTime() - toNight(checkIn).getTime()) / 86_400_000),
  );
}

export interface NightRate {
  date: Date;
  price: number;
  unitsFree: number;
  /**
   * Units inside somebody else's unfinished checkout. They are not sold — they
   * come back on their own when the hold expires — so they have to be told
   * apart from `unitsBooked` when explaining why a night cannot be taken.
   */
  unitsHeld: number;
  closed: boolean;
  minStay: number;
}

/** "15 Sep 2026" — read in UTC, because a night is a day and not an instant. */
function nightLabel(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Availability and pricing for one room across a date range. Nights with no
 * inventory document fall back to the room's own defaults, so a vendor never
 * has to pre-generate a calendar before their rooms can be booked.
 */
export async function getNightRates(
  room: Pick<IRoom, "_id" | "basePrice" | "totalUnits">,
  checkIn: Date,
  checkOut: Date,
): Promise<NightRate[]> {
  await connectDB();
  const nights = nightsBetween(checkIn, checkOut);
  if (nights.length === 0) return [];

  const docs = await RoomInventory.find({
    roomId: room._id,
    date: { $gte: nights[0], $lte: nights[nights.length - 1] },
  }).lean();

  const byDate = new Map(docs.map((d) => [toDateKey(d.date), d]));

  return nights.map((date) => {
    const row = byDate.get(toDateKey(date));
    if (!row) {
      return {
        date,
        price: room.basePrice,
        unitsFree: room.totalUnits,
        unitsHeld: 0,
        closed: false,
        minStay: 1,
      };
    }
    return {
      date,
      price: row.priceOverride ?? room.basePrice,
      unitsFree: Math.max(0, row.unitsTotal - row.unitsBooked - row.unitsHeld),
      unitsHeld: row.unitsHeld,
      closed: row.closed,
      minStay: row.minStay,
    };
  });
}

export interface Availability {
  available: boolean;
  reason?: string;
  /**
   * The room is not sold out — it is only inside someone else's unpaid
   * checkout, and comes back when that hold expires. Callers use this to say
   * "try again shortly" instead of "sold out".
   */
  heldOnly: boolean;
  nights: NightRate[];
  total: number;
}

/** Whether `units` of this room can be sold for every night in the range. */
export async function checkAvailability(
  room: Pick<IRoom, "_id" | "basePrice" | "totalUnits">,
  checkIn: Date,
  checkOut: Date,
  units = 1,
  holdMinutes = 15,
): Promise<Availability> {
  const nights = await getNightRates(room, checkIn, checkOut);
  const total = nights.reduce((sum, n) => sum + n.price, 0) * units;

  if (nights.length === 0) {
    return { available: false, reason: "Choose at least one night.", heldOnly: false, nights, total: 0 };
  }
  const closed = nights.find((n) => n.closed);
  if (closed) {
    return {
      available: false,
      reason: `Not open on ${nightLabel(closed.date)}.`,
      heldOnly: false,
      nights,
      total,
    };
  }
  const short = nights.find((n) => n.unitsFree < units);
  if (short) {
    // A night blocked only by holds is not sold out. Saying "sold out" there —
    // which is what a guest saw after their own payment failed — makes a room
    // that is about to free itself look permanently gone.
    const heldOnly = short.unitsFree + short.unitsHeld >= units;
    return {
      available: false,
      heldOnly,
      reason: heldOnly
        ? `Someone is part-way through checkout for ${nightLabel(short.date)}. If they do not pay, the room is released within ${holdMinutes} minutes — please try again shortly.`
        : `Sold out on ${nightLabel(short.date)}.`,
      nights,
      total,
    };
  }
  const minStay = Math.max(...nights.map((n) => n.minStay));
  if (nights.length < minStay) {
    return {
      available: false,
      reason: `These dates need a minimum stay of ${minStay} nights.`,
      heldOnly: false,
      nights,
      total,
    };
  }
  return { available: true, heldOnly: false, nights, total };
}

/**
 * Reserves `units` for every night, creating missing inventory rows on the way.
 * The conditional update is what makes this safe under concurrency: if another
 * checkout took the last unit between the availability check and here, the
 * matched count is zero and we abort the whole transaction.
 */
export async function holdUnits(
  roomId: string,
  hotelId: string,
  checkIn: Date,
  checkOut: Date,
  units: number,
  session: ClientSession,
): Promise<void> {
  const room = await Room.findById(roomId).session(session).lean();
  if (!room) throw new Error("Room not found.");

  for (const date of nightsBetween(checkIn, checkOut)) {
    await RoomInventory.updateOne(
      { roomId, date },
      {
        $setOnInsert: {
          hotelId,
          unitsTotal: room.totalUnits,
          unitsBooked: 0,
          closed: false,
          minStay: 1,
          priceOverride: null,
        },
      },
      { upsert: true, session },
    );

    const result = await RoomInventory.updateOne(
      {
        roomId,
        date,
        closed: false,
        $expr: {
          $gte: [
            { $subtract: ["$unitsTotal", { $add: ["$unitsBooked", "$unitsHeld"] }] },
            units,
          ],
        },
      },
      { $inc: { unitsHeld: units } },
      { session },
    );

    if (result.matchedCount === 0) {
      throw new InventoryConflictError(
        `That room was taken for ${nightLabel(date)} while you were checking out. If the other guest does not pay it will free up again shortly.`,
      );
    }
  }
}

/** Turns a hold into a confirmed booking. */
export async function commitHold(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  units: number,
  session?: ClientSession,
): Promise<void> {
  for (const date of nightsBetween(checkIn, checkOut)) {
    await RoomInventory.updateOne(
      { roomId, date, unitsHeld: { $gte: units } },
      { $inc: { unitsHeld: -units, unitsBooked: units } },
      { session },
    );
  }
}

/** Gives held units back — expiry, cancellation, or a failed payment. */
export async function releaseHold(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  units: number,
  session?: ClientSession,
): Promise<void> {
  for (const date of nightsBetween(checkIn, checkOut)) {
    await RoomInventory.updateOne(
      { roomId, date, unitsHeld: { $gte: units } },
      { $inc: { unitsHeld: -units } },
      { session },
    );
  }
}

/** Releases confirmed units — a cancelled or refunded booking. */
export async function releaseBooked(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  units: number,
  session?: ClientSession,
): Promise<void> {
  for (const date of nightsBetween(checkIn, checkOut)) {
    await RoomInventory.updateOne(
      { roomId, date, unitsBooked: { $gte: units } },
      { $inc: { unitsBooked: -units } },
      { session },
    );
  }
}

export class InventoryConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InventoryConflictError";
  }
}
