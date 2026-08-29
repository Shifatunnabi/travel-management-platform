"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { requireVendor } from "@/lib/auth/guards";
import { Hotel } from "@/lib/models/Hotel";
import { Room } from "@/lib/models/Room";
import { RoomInventory } from "@/lib/models/RoomInventory";
import { Vendor, VendorMember } from "@/lib/models/Vendor";
import { User } from "@/lib/models/User";
import { tags } from "@/lib/cache/tags";
import { uniqueSlug } from "@/lib/services/slug";
import { audit } from "@/lib/services/audit";
import { deleteAsset } from "@/lib/services/cloudinary";
import { toNight, toDateKey } from "@/lib/services/inventory";
import {
  bankDetailsSchema,
  hotelSchema,
  inventoryBulkSchema,
  roomSchema,
  vendorOnboardingSchema,
} from "@/lib/validation/hotel";
import { fail, parseForm, succeed, type ActionState } from "./_result";

/** Every vendor write goes through here — the hotel must belong to the caller. */
async function ownHotel(hotelId: string, vendorId: string) {
  if (!Types.ObjectId.isValid(hotelId)) return null;
  return Hotel.findOne({ _id: hotelId, vendorId });
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export async function saveOnboardingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { getSessionUser } = await import("@/lib/auth/guards");
  const user = await getSessionUser();
  if (!user) return fail("Sign in first.");

  const parsed = parseForm(vendorOnboardingSchema, formData);
  if (!parsed.ok) return parsed.state;
  const d = parsed.data;

  await connectDB();

  const existing = user.vendorId ? await Vendor.findById(user.vendorId) : null;

  if (existing) {
    if (existing.status === "approved") {
      // Approved businesses can still correct their details, but the change is
      // logged and does not reopen the approval queue.
      existing.set({
        businessName: d.businessName,
        contactEmail: d.contactEmail,
        contactPhone: d.contactPhone,
        address: d.address,
        city: d.city,
        tradeLicenceNo: d.tradeLicenceNo,
        tin: d.tin,
      });
      if (d.kycDocuments.length) existing.kycDocuments = d.kycDocuments as never;
      await existing.save();
      await audit({ actor: user, action: "vendor.profile.update", entity: "Vendor", entityId: String(existing._id) });
      return succeed("Business details updated.");
    }
    existing.set({ ...d, kycDocuments: d.kycDocuments, status: "pending" });
    await existing.save();
    await audit({ actor: user, action: "vendor.onboarding.resubmit", entity: "Vendor", entityId: String(existing._id) });
    return succeed("Application resubmitted. We will review it shortly.");
  }

  const vendor = await Vendor.create({
    ownerUserId: user.id,
    businessName: d.businessName,
    slug: await uniqueSlug(Vendor, d.businessName),
    contactEmail: d.contactEmail,
    contactPhone: d.contactPhone,
    address: d.address,
    city: d.city,
    tradeLicenceNo: d.tradeLicenceNo,
    tin: d.tin,
    kycDocuments: d.kycDocuments,
    status: "pending",
  });

  await VendorMember.create({ vendorId: vendor._id, userId: user.id, role: "owner" });
  await User.updateOne({ _id: user.id }, { $set: { role: "vendor" } });
  await audit({ actor: user, action: "vendor.onboarding.submit", entity: "Vendor", entityId: String(vendor._id) });

  return succeed(
    "Application submitted. You can start drafting properties while we review it.",
  );
}

export async function saveBankDetailsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireVendor(["owner"]);
  const parsed = parseForm(bankDetailsSchema, formData);
  if (!parsed.ok) return parsed.state;

  await connectDB();
  const vendor = await Vendor.findById(user.vendorId);
  if (!vendor) return fail("Vendor not found.");

  const before = { ...vendor.bank };
  const changedAccount = vendor.bank.accountNumber !== parsed.data.accountNumber;

  vendor.bank = {
    ...parsed.data,
    // Changing the account number sends it back for verification, so a
    // compromised login cannot redirect payouts to a new account.
    verified: changedAccount ? false : vendor.bank.verified,
    verifiedAt: changedAccount ? null : vendor.bank.verifiedAt,
  };
  await vendor.save();

  await audit({
    actor: user, action: "vendor.bank.update", entity: "Vendor",
    entityId: String(vendor._id), before, after: vendor.bank,
  });

  return succeed(
    changedAccount
      ? "Bank details saved. They need platform verification before the next payout."
      : "Bank details saved.",
  );
}

// ─── Hotels ──────────────────────────────────────────────────────────────────

export async function saveHotelAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireVendor(["owner", "manager"]);
  const parsed = parseForm(hotelSchema, formData);
  if (!parsed.ok) return parsed.state;

  const d = parsed.data;
  const hotelId = String(formData.get("hotelId") ?? "");
  await connectDB();

  const fields = {
    name: d.name,
    description: d.description,
    propertyType: d.propertyType,
    starCategory: d.starCategory,
    address: d.address,
    city: d.city,
    country: d.country,
    location: d.location,
    distanceFromCenter: d.distanceFromCenter,
    amenities: d.amenities,
    tags: d.tags,
    images: d.images,
    policies: {
      checkInTime: d.checkInTime,
      checkOutTime: d.checkOutTime,
      cancellationHours: d.cancellationHours,
      childrenAllowed: d.childrenAllowed,
      petsAllowed: d.petsAllowed,
      extraNotes: d.extraNotes,
    },
    ...(d.latitude != null && d.longitude != null
      ? { geo: { type: "Point" as const, coordinates: [d.longitude, d.latitude] as [number, number] } }
      : {}),
  };

  if (hotelId) {
    const hotel = await ownHotel(hotelId, user.vendorId);
    if (!hotel) return fail("That property does not exist.");

    if (hotel.status === "published") {
      // A live listing keeps serving the approved version; the edit waits in
      // the moderation queue as a revision.
      hotel.pendingRevision = fields;
      await hotel.save();
      await audit({ actor: user, action: "hotel.revision.submit", entity: "Hotel", entityId: hotelId, after: fields });
      revalidatePath("/vendor/hotels");
      return succeed("Changes submitted for review. Your live listing is unchanged until approved.");
    }

    hotel.set(fields);
    if (hotel.name !== d.name) hotel.slug = await uniqueSlug(Hotel, d.name, hotelId);
    await hotel.save();
    await audit({ actor: user, action: "hotel.update", entity: "Hotel", entityId: hotelId });
    updateTag(tags.hotel(hotelId));
    revalidatePath("/vendor/hotels");
    return succeed("Property saved.");
  }

  const created = await Hotel.create({
    ...fields,
    vendorId: user.vendorId,
    slug: await uniqueSlug(Hotel, d.name),
    status: "draft",
  });
  await audit({ actor: user, action: "hotel.create", entity: "Hotel", entityId: String(created._id) });
  redirect(`/vendor/hotels/${created._id}/rooms`);
}

export async function submitHotelAction(hotelId: string): Promise<ActionState> {
  const user = await requireVendor(["owner", "manager"]);
  await connectDB();

  const hotel = await ownHotel(hotelId, user.vendorId);
  if (!hotel) return fail("That property does not exist.");
  if (hotel.status === "published") return fail("This property is already live.");

  const roomCount = await Room.countDocuments({ hotelId, status: "active" });
  if (roomCount === 0) return fail("Add at least one room before submitting for review.");
  if (hotel.images.length < 3) return fail("Add at least three photos before submitting.");

  hotel.status = "pending_review";
  hotel.moderation = { reviewedBy: null, note: undefined, at: null };
  await hotel.save();

  await audit({ actor: user, action: "hotel.submit", entity: "Hotel", entityId: hotelId });
  revalidatePath("/vendor/hotels");
  return succeed("Submitted for review. We usually respond within a working day.");
}

export async function setHotelVisibilityAction(
  hotelId: string,
  publish: boolean,
): Promise<ActionState> {
  const user = await requireVendor(["owner", "manager"]);
  await connectDB();

  const hotel = await ownHotel(hotelId, user.vendorId);
  if (!hotel) return fail("That property does not exist.");

  if (publish) {
    // Re-listing never bypasses moderation — it returns to the queue.
    if (hotel.status !== "draft") return fail("This property is not paused.");
    hotel.status = "pending_review";
  } else {
    if (hotel.status !== "published") return fail("This property is not live.");
    hotel.status = "draft";
  }
  await hotel.save();

  await audit({
    actor: user, action: publish ? "hotel.relist" : "hotel.unpublish",
    entity: "Hotel", entityId: hotelId,
  });
  updateTag(tags.hotel(hotelId));
  updateTag(tags.hotelsByCity(hotel.city));
  revalidatePath("/vendor/hotels");
  return succeed(publish ? "Sent back for review." : "Property paused and removed from search.");
}

// ─── Rooms ───────────────────────────────────────────────────────────────────

export async function saveRoomAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireVendor(["owner", "manager"]);
  const parsed = parseForm(roomSchema, formData);
  if (!parsed.ok) return parsed.state;

  const hotelId = String(formData.get("hotelId") ?? "");
  const roomId = String(formData.get("roomId") ?? "");
  await connectDB();

  const hotel = await ownHotel(hotelId, user.vendorId);
  if (!hotel) return fail("That property does not exist.");

  const d = parsed.data;
  const fields = {
    name: d.name,
    description: d.description,
    bedType: d.bedType,
    sizeSqm: d.sizeSqm,
    maxAdults: d.maxAdults,
    maxChildren: d.maxChildren,
    basePrice: d.basePrice,
    totalUnits: d.totalUnits,
    amenities: d.amenities,
    images: d.images,
    ratePlans: d.ratePlans,
  };

  if (roomId) {
    const room = await Room.findOne({ _id: roomId, hotelId, vendorId: user.vendorId });
    if (!room) return fail("That room does not exist.");
    const before = { basePrice: room.basePrice, totalUnits: room.totalUnits };
    room.set(fields);
    await room.save();
    await audit({
      actor: user, action: "room.update", entity: "Room", entityId: roomId,
      before, after: { basePrice: d.basePrice, totalUnits: d.totalUnits },
    });
  } else {
    const room = await Room.create({ ...fields, hotelId, vendorId: user.vendorId });
    await audit({ actor: user, action: "room.create", entity: "Room", entityId: String(room._id) });
  }

  await refreshPriceFrom(hotelId);
  updateTag(tags.hotel(hotelId));
  updateTag(tags.rooms(hotelId));
  revalidatePath(`/vendor/hotels/${hotelId}/rooms`);
  return succeed(roomId ? "Room saved." : "Room added.");
}

export async function setRoomStatusAction(
  roomId: string,
  active: boolean,
): Promise<ActionState> {
  const user = await requireVendor(["owner", "manager"]);
  await connectDB();

  const room = await Room.findOne({ _id: roomId, vendorId: user.vendorId });
  if (!room) return fail("That room does not exist.");

  room.status = active ? "active" : "inactive";
  await room.save();

  await refreshPriceFrom(String(room.hotelId));
  await audit({ actor: user, action: active ? "room.activate" : "room.deactivate", entity: "Room", entityId: roomId });
  updateTag(tags.rooms(String(room.hotelId)));
  revalidatePath(`/vendor/hotels/${room.hotelId}/rooms`);
  return succeed(active ? "Room is back on sale." : "Room taken off sale.");
}

export async function deleteImageAction(publicId: string): Promise<void> {
  await requireVendor(["owner", "manager"]);
  await deleteAsset(publicId);
}

/** Keeps the denormalized `priceFrom` that search cards and sorting read. */
async function refreshPriceFrom(hotelId: string): Promise<void> {
  const rooms = await Room.find({ hotelId, status: "active" }).select("basePrice ratePlans").lean();
  const prices = rooms.flatMap((r) =>
    r.ratePlans.length
      ? r.ratePlans.map((p) => r.basePrice + p.priceDelta)
      : [r.basePrice],
  );
  await Hotel.updateOne(
    { _id: hotelId },
    { $set: { priceFrom: prices.length ? Math.min(...prices) : 0 } },
  );
}

// ─── Rates & availability ────────────────────────────────────────────────────

export async function bulkInventoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireVendor(["owner", "manager"]);
  const parsed = parseForm(inventoryBulkSchema, formData);
  if (!parsed.ok) return parsed.state;

  const d = parsed.data;
  await connectDB();

  const room = await Room.findOne({ _id: d.roomId, vendorId: user.vendorId });
  if (!room) return fail("That room does not exist.");

  const from = toNight(d.from);
  const to = toNight(d.to);
  if ((to.getTime() - from.getTime()) / 86_400_000 > 366) {
    return fail("Pick a range of a year or less.");
  }

  const set: Record<string, unknown> = {};
  if (d.price !== null) set.priceOverride = d.price;
  if (d.unitsTotal !== null) set.unitsTotal = d.unitsTotal;
  if (d.minStay !== null) set.minStay = d.minStay;
  if (d.closed !== "unchanged") set.closed = d.closed === "closed";

  const operations = [];
  for (let c = new Date(from); c <= to; c.setUTCDate(c.getUTCDate() + 1)) {
    if (!d.weekdays.includes(c.getUTCDay())) continue;
    const date = new Date(c);
    operations.push({
      updateOne: {
        filter: { roomId: room._id, date },
        update: {
          $set: set,
          $setOnInsert: {
            hotelId: room.hotelId,
            unitsTotal: d.unitsTotal ?? room.totalUnits,
            unitsBooked: 0,
            unitsHeld: 0,
            ...(d.price === null ? { priceOverride: null } : {}),
            ...(d.minStay === null ? { minStay: 1 } : {}),
            ...(d.closed === "unchanged" ? { closed: false } : {}),
          },
        },
        upsert: true,
      },
    });
  }

  if (operations.length === 0) {
    return fail("No dates matched — check the weekday selection.");
  }

  await RoomInventory.bulkWrite(operations);
  await audit({
    actor: user, action: "inventory.bulk_update", entity: "Room", entityId: d.roomId,
    after: { from: d.from, to: d.to, weekdays: d.weekdays, ...set },
  });

  revalidatePath(`/vendor/hotels/${room.hotelId}/calendar`);
  return succeed(`Updated ${operations.length} night${operations.length === 1 ? "" : "s"}.`);
}

export async function setNightAction(
  roomId: string,
  dateKey: string,
  patch: { price?: number | null; unitsTotal?: number; closed?: boolean; minStay?: number },
): Promise<ActionState> {
  const user = await requireVendor(["owner", "manager"]);
  await connectDB();

  const room = await Room.findOne({ _id: roomId, vendorId: user.vendorId });
  if (!room) return fail("That room does not exist.");

  const date = toNight(dateKey);
  const existing = await RoomInventory.findOne({ roomId, date });
  const committed = (existing?.unitsBooked ?? 0) + (existing?.unitsHeld ?? 0);

  if (patch.unitsTotal != null && patch.unitsTotal < committed) {
    return fail(`${committed} already sold for ${dateKey} — you cannot drop below that.`);
  }

  const set: Record<string, unknown> = {};
  if (patch.price !== undefined) set.priceOverride = patch.price;
  if (patch.unitsTotal !== undefined) set.unitsTotal = patch.unitsTotal;
  if (patch.closed !== undefined) set.closed = patch.closed;
  if (patch.minStay !== undefined) set.minStay = patch.minStay;

  await RoomInventory.updateOne(
    { roomId, date },
    {
      $set: set,
      $setOnInsert: {
        hotelId: room.hotelId,
        unitsTotal: room.totalUnits,
        unitsBooked: 0,
        unitsHeld: 0,
      },
    },
    { upsert: true },
  );

  revalidatePath(`/vendor/hotels/${room.hotelId}/calendar`);
  return succeed(`${toDateKey(date)} updated.`);
}
