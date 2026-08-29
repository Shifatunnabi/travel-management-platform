import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Hotel } from "@/lib/models/Hotel";
import { Vendor } from "@/lib/models/Vendor";
import { User } from "@/lib/models/User";
import { Booking } from "@/lib/models/Booking";
import { Payment } from "@/lib/models/Payment";
import { Payout } from "@/lib/models/Payout";
import { Review } from "@/lib/models/Review";
import { LedgerEntry } from "@/lib/models/Ledger";
import { AuditLog } from "@/lib/models/AuditLog";
import type { BookingStatus, HotelStatus, ReviewStatus, VendorStatus } from "@/lib/models/types";

const LIVE: BookingStatus[] = ["confirmed", "checked_in", "completed"];

export interface AdminSummary {
  gmv30d: number;
  commission30d: number;
  bookings30d: number;
  cancellationRate: number;
  gmvPrev30d: number;
  vendorsActive: number;
  vendorsPending: number;
  hotelsLive: number;
  hotelsPending: number;
  reviewsPending: number;
  payoutsPending: number;
  payoutsPendingAmount: number;
  paymentsFailed7d: number;
  customers: number;
}

export async function getAdminSummary(): Promise<AdminSummary> {
  await connectDB();
  const now = new Date();
  const ago30 = new Date(now); ago30.setUTCDate(ago30.getUTCDate() - 30);
  const ago60 = new Date(now); ago60.setUTCDate(ago60.getUTCDate() - 60);
  const ago7 = new Date(now); ago7.setUTCDate(ago7.getUTCDate() - 7);

  const [
    revenue, revenuePrev, cancelled, total30,
    vendorStatuses, hotelStatuses, reviewsPending,
    payoutAgg, paymentsFailed7d, customers,
  ] = await Promise.all([
    Booking.aggregate<{ gmv: number; commission: number; count: number }>([
      { $match: { status: { $in: LIVE }, createdAt: { $gte: ago30 } } },
      { $group: { _id: null, gmv: { $sum: "$pricing.grandTotal" }, commission: { $sum: "$pricing.commissionAmount" }, count: { $sum: 1 } } },
    ]),
    Booking.aggregate<{ gmv: number }>([
      { $match: { status: { $in: LIVE }, createdAt: { $gte: ago60, $lt: ago30 } } },
      { $group: { _id: null, gmv: { $sum: "$pricing.grandTotal" } } },
    ]),
    Booking.countDocuments({ status: { $in: ["cancelled", "refunded"] }, createdAt: { $gte: ago30 } }),
    Booking.countDocuments({ createdAt: { $gte: ago30 }, status: { $ne: "pending_payment" } }),
    Vendor.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Hotel.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Review.countDocuments({ status: "pending" }),
    Payout.aggregate<{ count: number; total: number }>([
      { $match: { status: { $in: ["requested", "under_review"] } } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$requestedAmount" } } },
    ]),
    Payment.countDocuments({ status: "failed", createdAt: { $gte: ago7 } }),
    User.countDocuments({ role: "customer" }),
  ]);

  const v = new Map(vendorStatuses.map((s) => [s._id, s.count]));
  const h = new Map(hotelStatuses.map((s) => [s._id, s.count]));

  return {
    gmv30d: revenue[0]?.gmv ?? 0,
    commission30d: revenue[0]?.commission ?? 0,
    bookings30d: revenue[0]?.count ?? 0,
    gmvPrev30d: revenuePrev[0]?.gmv ?? 0,
    cancellationRate: total30 > 0 ? Math.round((cancelled / total30) * 100) : 0,
    vendorsActive: v.get("approved") ?? 0,
    vendorsPending: v.get("pending") ?? 0,
    hotelsLive: h.get("published") ?? 0,
    hotelsPending: h.get("pending_review") ?? 0,
    reviewsPending,
    payoutsPending: payoutAgg[0]?.count ?? 0,
    payoutsPendingAmount: payoutAgg[0]?.total ?? 0,
    paymentsFailed7d,
    customers,
  };
}

export async function listVendors(status?: string) {
  await connectDB();
  const filter = status && status !== "all" ? { status: status as VendorStatus } : {};
  const vendors = await Vendor.find(filter).sort({ createdAt: -1 }).limit(200).lean();

  const counts = await Hotel.aggregate<{ _id: Types.ObjectId; total: number; live: number }>([
    {
      $group: {
        _id: "$vendorId",
        total: { $sum: 1 },
        live: { $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] } },
      },
    },
  ]);
  const byVendor = new Map(counts.map((c) => [String(c._id), c]));

  return vendors.map((v) => ({
    ...v,
    hotelCount: byVendor.get(String(v._id))?.total ?? 0,
    liveCount: byVendor.get(String(v._id))?.live ?? 0,
  }));
}

export async function getVendorDetail(vendorId: string) {
  if (!Types.ObjectId.isValid(vendorId)) return null;
  await connectDB();
  const vendor = await Vendor.findById(vendorId).lean();
  if (!vendor) return null;

  const [owner, hotels, ledger, payouts, bookings] = await Promise.all([
    User.findById(vendor.ownerUserId).select("name email phone createdAt").lean(),
    Hotel.find({ vendorId }).select("name city status displayRating priceFrom").sort({ createdAt: -1 }).lean(),
    LedgerEntry.aggregate<{ _id: string; total: number }>([
      { $match: { vendorId: new Types.ObjectId(vendorId) } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]),
    Payout.find({ vendorId }).sort({ createdAt: -1 }).limit(10).lean(),
    Booking.countDocuments({ vendorId, status: { $in: LIVE } }),
  ]);

  return { vendor, owner, hotels, ledger, payouts, bookingCount: bookings };
}

export async function listHotelsForModeration(status?: string) {
  await connectDB();
  const filter =
    status && status !== "all"
      ? status === "revisions"
        ? { pendingRevision: { $ne: null } }
        : { status: status as HotelStatus }
      : {};

  const hotels = await Hotel.find(filter)
    .select("name city status images displayRating displayReviewCount reviewStats ratingAdjustment priceFrom featured pendingRevision vendorId createdAt starCategory")
    .sort({ status: 1, createdAt: -1 })
    .limit(200)
    .lean();

  const vendorIds = [...new Set(hotels.map((h) => String(h.vendorId)))];
  const vendors = await Vendor.find({ _id: { $in: vendorIds } }).select("businessName").lean();
  const byId = new Map(vendors.map((v) => [String(v._id), v.businessName]));

  return hotels.map((h) => ({ ...h, vendorName: byId.get(String(h.vendorId)) ?? "Unknown" }));
}

export async function getHotelForAdmin(hotelId: string) {
  if (!Types.ObjectId.isValid(hotelId)) return null;
  await connectDB();
  const hotel = await Hotel.findById(hotelId).lean();
  if (!hotel) return null;
  const vendor = await Vendor.findById(hotel.vendorId).select("businessName status").lean();
  return { hotel, vendor };
}

export async function listReviews(status = "pending") {
  await connectDB();
  const filter =
    status === "reported"
      ? { reported: { $ne: null } }
      : status === "all"
        ? {}
        : { status: status as ReviewStatus };

  const reviews = await Review.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  const hotelIds = [...new Set(reviews.map((r) => String(r.hotelId)))];
  const hotels = await Hotel.find({ _id: { $in: hotelIds } }).select("name city").lean();
  const byId = new Map(hotels.map((h) => [String(h._id), h]));

  return reviews.map((r) => ({
    ...r,
    hotelName: byId.get(String(r.hotelId))?.name ?? "Unknown property",
    hotelCity: byId.get(String(r.hotelId))?.city ?? "",
  }));
}

export async function listAuditLogs(filters: { entity?: string; action?: string; page?: number }) {
  await connectDB();
  const page = Math.max(1, filters.page ?? 1);
  const query: Record<string, unknown> = {};
  if (filters.entity && filters.entity !== "all") query.entity = filters.entity;
  if (filters.action) query.action = { $regex: filters.action, $options: "i" };

  const [logs, total] = await Promise.all([
    AuditLog.find(query).sort({ createdAt: -1 }).skip((page - 1) * 40).limit(40).lean(),
    AuditLog.countDocuments(query),
  ]);
  return { logs, total, page, pages: Math.max(1, Math.ceil(total / 40)) };
}

export async function listUsers(role?: string, search?: string) {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (role && role !== "all") query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  return User.find(query)
    .select("name email phone role platformRole status emailVerifiedAt createdAt")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
}

/** Every hotel whose displayed rating has been moved away from its true average. */
export async function listAdjustedRatings() {
  await connectDB();
  return Hotel.find({ "ratingAdjustment.mode": { $ne: "none" } })
    .select("name city reviewStats ratingAdjustment displayRating displayReviewCount")
    .sort({ "ratingAdjustment.setAt": -1 })
    .lean();
}
