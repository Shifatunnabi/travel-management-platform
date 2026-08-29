import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { LedgerEntry } from "@/lib/models/Ledger";
import type { PayoutStatus } from "@/lib/models/types";
import { Payout } from "@/lib/models/Payout";

export interface VendorBalance {
  /** Withdrawable right now. */
  available: number;
  /** Earned but still inside the settlement window. */
  pending: number;
  /** Locked by a disbursement request that has not been paid or rejected. */
  requested: number;
  /** available − requested; what a new request may draw on. */
  withdrawable: number;
  lifetimeEarned: number;
  lifetimeCommission: number;
  lifetimePaidOut: number;
}

/**
 * Balances come from summing the ledger, never from re-adding bookings — so a
 * refund, an adjustment and a payout all reduce the same number without any
 * special cases.
 */
export async function getVendorBalance(vendorId: string): Promise<VendorBalance> {
  await connectDB();
  const vid = new Types.ObjectId(vendorId);
  const now = new Date();

  const [buckets, lifetime, locked] = await Promise.all([
    LedgerEntry.aggregate<{ _id: boolean; total: number }>([
      { $match: { vendorId: vid, settledAt: null, type: { $ne: "payout" } } },
      {
        $group: {
          _id: {
            $or: [{ $eq: ["$availableAt", null] }, { $lte: ["$availableAt", now] }],
          },
          total: { $sum: "$amount" },
        },
      },
    ]),
    LedgerEntry.aggregate<{ _id: string; total: number }>([
      { $match: { vendorId: vid } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]),
    Payout.aggregate<{ total: number }>([
      { $match: { vendorId: vid, status: { $in: ["requested", "under_review", "approved"] } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$approvedAmount", "$requestedAmount"] } } } },
    ]),
  ]);

  const byType = new Map(lifetime.map((l) => [l._id, l.total]));
  const paidOut = Math.abs(byType.get("payout") ?? 0);
  const available = Math.max(0, Math.round(buckets.find((b) => b._id === true)?.total ?? 0) - paidOut);
  const pending = Math.max(0, Math.round(buckets.find((b) => b._id === false)?.total ?? 0));
  const requested = Math.round(locked[0]?.total ?? 0);

  return {
    available,
    pending,
    requested,
    withdrawable: Math.max(0, available - requested),
    lifetimeEarned: Math.round(byType.get("earning") ?? 0),
    lifetimeCommission: Math.abs(Math.round(byType.get("commission") ?? 0)),
    lifetimePaidOut: paidOut,
  };
}

export interface LedgerRow {
  id: string;
  type: string;
  amount: number;
  note?: string;
  bookingRef?: string;
  availableAt: string | null;
  createdAt: string;
}

export async function listLedger(vendorId: string, limit = 100): Promise<LedgerRow[]> {
  await connectDB();
  const entries = await LedgerEntry.find({ vendorId })
    .populate<{ bookingId: { ref: string } | null }>("bookingId", "ref")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return entries.map((e) => ({
    id: String(e._id),
    type: e.type,
    amount: e.amount,
    note: e.note,
    bookingRef: (e.bookingId as unknown as { ref?: string } | null)?.ref,
    availableAt: e.availableAt?.toISOString() ?? null,
    createdAt: e.createdAt.toISOString(),
  }));
}

export async function listVendorPayouts(vendorId: string) {
  await connectDB();
  return Payout.find({ vendorId }).sort({ createdAt: -1 }).limit(50).lean();
}

export async function listAllPayouts(status?: string) {
  await connectDB();
  const query = status && status !== "all" ? { status: status as PayoutStatus } : {};
  const payouts = await Payout.find(query).sort({ createdAt: 1 }).limit(200).lean();

  const { Vendor } = await import("@/lib/models/Vendor");
  const vendors = await Vendor.find({ _id: { $in: payouts.map((p) => p.vendorId) } })
    .select("businessName bank contactEmail")
    .lean();
  const byId = new Map(vendors.map((v) => [String(v._id), v]));

  return payouts.map((p) => ({
    ...p,
    vendorName: byId.get(String(p.vendorId))?.businessName ?? "Unknown",
    vendorEmail: byId.get(String(p.vendorId))?.contactEmail ?? "",
    bankVerified: byId.get(String(p.vendorId))?.bank.verified ?? false,
  }));
}
