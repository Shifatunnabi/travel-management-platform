import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { Settings, SETTINGS_DEFAULTS, type ISettings } from "@/lib/models/Settings";
import { tags } from "@/lib/cache/tags";

export type PlatformSettings = Omit<ISettings, "_id" | "key" | "updatedAt">;

/** Uncached read — use inside mutations where a stale value would be wrong. */
export async function readSettings(): Promise<PlatformSettings> {
  await connectDB();
  const doc = await Settings.findOne({ key: "global" }).lean();
  if (!doc) return { ...SETTINGS_DEFAULTS };
  return {
    defaultCommissionPct: doc.defaultCommissionPct,
    taxPct: doc.taxPct,
    serviceFee: doc.serviceFee,
    currency: doc.currency,
    settlementDays: doc.settlementDays,
    holdMinutes: doc.holdMinutes,
    maxRatingOffset: doc.maxRatingOffset,
    minPayoutAmount: doc.minPayoutAmount,
    supportEmail: doc.supportEmail,
    supportPhone: doc.supportPhone,
  };
}

/** Cached read for rendering. Invalidated by the settings admin form. */
export async function getSettings(): Promise<PlatformSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.settings());
  return readSettings();
}
