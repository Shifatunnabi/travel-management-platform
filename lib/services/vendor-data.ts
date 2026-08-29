import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Hotel } from "@/lib/models/Hotel";
import { Room } from "@/lib/models/Room";
import { RoomInventory } from "@/lib/models/RoomInventory";
import { Booking } from "@/lib/models/Booking";
import { LedgerEntry } from "@/lib/models/Ledger";
import { Payout } from "@/lib/models/Payout";
import { Review } from "@/lib/models/Review";
import { Vendor } from "@/lib/models/Vendor";
import type { BookingStatus } from "@/lib/models/types";
import { toNight, toDateKey } from "./inventory";

export async function getVendor(vendorId: string) {
  await connectDB();
  return Vendor.findById(vendorId).lean();
}

export async function listVendorHotels(vendorId: string) {
  await connectDB();
  const hotels = await Hotel.find({ vendorId })
    .select("name slug city status images priceFrom displayRating displayReviewCount pendingRevision starCategory moderation")
    .sort({ createdAt: -1 })
    .lean();

  const counts = await Room.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { vendorId: new Types.ObjectId(vendorId), status: "active" } },
    { $group: { _id: "$hotelId", count: { $sum: 1 } } },
  ]);
  const byHotel = new Map(counts.map((c) => [String(c._id), c.count]));

  return hotels.map((h) => ({ ...h, roomCount: byHotel.get(String(h._id)) ?? 0 }));
}

export async function getVendorHotel(hotelId: string, vendorId: string) {
  if (!Types.ObjectId.isValid(hotelId)) return null;
  await connectDB();
  return Hotel.findOne({ _id: hotelId, vendorId }).lean();
}

export async function listHotelRooms(hotelId: string, vendorId: string) {
  await connectDB();
  return Room.find({ hotelId, vendorId }).sort({ basePrice: 1 }).lean();
}

export async function getRoom(roomId: string, vendorId: string) {
  if (!Types.ObjectId.isValid(roomId)) return null;
  await connectDB();
  return Room.findOne({ _id: roomId, vendorId }).lean();
}

export interface CalendarNight {
  dateKey: string;
  price: number;
  unitsTotal: number;
  unitsBooked: number;
  unitsHeld: number;
  unitsFree: number;
  closed: boolean;
  minStay: number;
  hasOverride: boolean;
}

/** A room's calendar for `days` nights from `startKey`, filling gaps from defaults. */
export async function getRoomCalendar(
  roomId: string,
  vendorId: string,
  startKey: string,
  days = 35,
): Promise<{ room: Awaited<ReturnType<typeof getRoom>>; nights: CalendarNight[] } | null> {
  const room = await getRoom(roomId, vendorId);
  if (!room) return null;

  const start = toNight(startKey);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + days - 1);

  const rows = await RoomInventory.find({
    roomId: room._id,
    date: { $gte: start, $lte: end },
  }).lean();
  const byDate = new Map(rows.map((r) => [toDateKey(r.date), r]));

  const nights: CalendarNight[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    const key = toDateKey(d);
    const row = byDate.get(key);
    nights.push({
      dateKey: key,
      price: row?.priceOverride ?? room.basePrice,
      unitsTotal: row?.unitsTotal ?? room.totalUnits,
      unitsBooked: row?.unitsBooked ?? 0,
      unitsHeld: row?.unitsHeld ?? 0,
      unitsFree: Math.max(
        0,
        (row?.unitsTotal ?? room.totalUnits) - (row?.unitsBooked ?? 0) - (row?.unitsHeld ?? 0),
      ),
      closed: row?.closed ?? false,
      minStay: row?.minStay ?? 1,
      hasOverride: row?.priceOverride != null,
    });
  }

  return { room, nights };
}

export interface VendorSummary {
  arrivalsToday: number;
  departuresToday: number;
  staying: number;
  bookings30d: number;
  revenue30d: number;
  revenuePrev30d: number;
  occupancy7d: number;
  availableBalance: number;
  pendingBalance: number;
  pendingPayouts: number;
  rating: number;
  reviewCount: number;
  unansweredReviews: number;
  hotelsLive: number;
  hotelsPending: number;
  hotelsDraft: number;
}

export async function getVendorSummary(vendorId: string): Promise<VendorSummary> {
  await connectDB();
  const vid = new Types.ObjectId(vendorId);
  const today = toNight(new Date());
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const in7 = new Date(today);
  in7.setUTCDate(in7.getUTCDate() + 7);
  const ago30 = new Date(today);
  ago30.setUTCDate(ago30.getUTCDate() - 30);
  const ago60 = new Date(today);
  ago60.setUTCDate(ago60.getUTCDate() - 60);

  const live: BookingStatus[] = ["confirmed", "checked_in", "completed"];

  const [
    arrivalsToday, departuresToday, staying,
    bookings30d, revenueAgg, revenuePrevAgg,
    ledgerAgg, pendingPayouts, hotelStatuses, reviewAgg, unansweredReviews,
    inventoryAgg,
  ] = await Promise.all([
    Booking.countDocuments({ vendorId: vid, status: "confirmed", checkIn: { $gte: today, $lt: tomorrow } }),
    Booking.countDocuments({ vendorId: vid, status: "checked_in", checkOut: { $gte: today, $lt: tomorrow } }),
    Booking.countDocuments({ vendorId: vid, status: "checked_in" }),
    Booking.countDocuments({ vendorId: vid, status: { $in: live }, createdAt: { $gte: ago30 } }),
    Booking.aggregate<{ total: number }>([
      { $match: { vendorId: vid, status: { $in: live }, createdAt: { $gte: ago30 } } },
      { $group: { _id: null, total: { $sum: "$pricing.vendorEarning" } } },
    ]),
    Booking.aggregate<{ total: number }>([
      { $match: { vendorId: vid, status: { $in: live }, createdAt: { $gte: ago60, $lt: ago30 } } },
      { $group: { _id: null, total: { $sum: "$pricing.vendorEarning" } } },
    ]),
    LedgerEntry.aggregate<{ _id: boolean; total: number }>([
      { $match: { vendorId: vid, settledAt: null } },
      {
        $group: {
          _id: { $or: [{ $eq: ["$availableAt", null] }, { $lte: ["$availableAt", new Date()] }] },
          total: { $sum: "$amount" },
        },
      },
    ]),
    Payout.countDocuments({ vendorId: vid, status: { $in: ["requested", "under_review", "approved"] } }),
    Hotel.aggregate<{ _id: string; count: number }>([
      { $match: { vendorId: vid } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Review.aggregate<{ count: number; sum: number }>([
      { $match: { vendorId: vid, status: "published" } },
      { $group: { _id: null, count: { $sum: 1 }, sum: { $sum: "$rating" } } },
    ]),
    Review.countDocuments({ vendorId: vid, status: "published", vendorReply: null }),
    RoomInventory.aggregate<{ total: number; booked: number }>([
      { $match: { date: { $gte: today, $lt: in7 } } },
      { $lookup: { from: "rooms", localField: "roomId", foreignField: "_id", as: "room" } },
      { $unwind: "$room" },
      { $match: { "room.vendorId": vid } },
      { $group: { _id: null, total: { $sum: "$unitsTotal" }, booked: { $sum: "$unitsBooked" } } },
    ]),
  ]);

  const statuses = new Map(hotelStatuses.map((s) => [s._id, s.count]));
  const available = ledgerAgg.find((l) => l._id === true)?.total ?? 0;
  const pending = ledgerAgg.find((l) => l._id === false)?.total ?? 0;
  const inv = inventoryAgg[0];
  const reviews = reviewAgg[0];

  return {
    arrivalsToday,
    departuresToday,
    staying,
    bookings30d,
    revenue30d: revenueAgg[0]?.total ?? 0,
    revenuePrev30d: revenuePrevAgg[0]?.total ?? 0,
    occupancy7d: inv && inv.total > 0 ? Math.round((inv.booked / inv.total) * 100) : 0,
    availableBalance: Math.max(0, Math.round(available)),
    pendingBalance: Math.max(0, Math.round(pending)),
    pendingPayouts,
    rating: reviews?.count ? Math.round((reviews.sum / reviews.count) * 10) / 10 : 0,
    reviewCount: reviews?.count ?? 0,
    unansweredReviews,
    hotelsLive: statuses.get("published") ?? 0,
    hotelsPending: statuses.get("pending_review") ?? 0,
    hotelsDraft: statuses.get("draft") ?? 0,
  };
}
