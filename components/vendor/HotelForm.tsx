"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveHotelAction } from "@/lib/actions/vendor";
import { idleState } from "@/lib/actions/_result";
import { Card } from "@/components/admin/Shell";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";
import ImageUploader, { type UploadedImage } from "@/components/admin/ImageUploader";
import { ChipsInput, FormGrid, Select, TextArea, TextInput, Toggle } from "@/components/admin/Inputs";
import { PROPERTY_TYPES } from "@/lib/models/types";

const AMENITY_SUGGESTIONS = [
  "Free WiFi", "Swimming Pool", "Restaurant", "Spa", "Gym", "Parking",
  "Room Service", "Airport Shuttle", "Beach Access", "Bar", "Laundry",
  "Business Centre", "Air Conditioning", "24h Front Desk", "Lift",
];

const TAG_SUGGESTIONS = [
  "Beachfront", "Luxury", "Family Friendly", "Business", "Sea View",
  "Budget", "Romantic", "Pet Friendly",
];

export interface HotelFormValues {
  _id?: string;
  name: string;
  description: string;
  propertyType: string;
  starCategory: number;
  address: string;
  city: string;
  country: string;
  location: string;
  latitude?: number;
  longitude?: number;
  distanceFromCenter?: number;
  amenities: string[];
  tags: string[];
  images: UploadedImage[];
  policies: {
    checkInTime: string;
    checkOutTime: string;
    cancellationHours: number;
    childrenAllowed: boolean;
    petsAllowed: boolean;
    extraNotes?: string;
  };
}

export default function HotelForm({
  initial,
  vendorId,
  isPublished,
}: {
  initial?: HotelFormValues;
  vendorId: string;
  isPublished?: boolean;
}) {
  const [state, action] = useActionState(saveHotelAction, idleState);
  const e = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={action} className="space-y-6">
      {initial?._id && <input type="hidden" name="hotelId" value={initial._id} />}
      <ActionMessage state={state} />

      {isPublished && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          This property is live. Saving submits your changes for review — the public listing keeps
          showing the approved version until then.
        </div>
      )}

      <Card title="The basics" description="What guests see first in search results.">
        <div className="space-y-4">
          <TextInput label="Property name" name="name" required defaultValue={initial?.name} placeholder="The Peninsula Cox's Bazar" errors={e?.name} />
          <TextArea
            label="Description"
            name="description"
            required
            rows={6}
            defaultValue={initial?.description}
            placeholder="What makes this property worth choosing? Mention the location, the rooms, and what is included."
            hint="At least 80 characters. This is the main text on your listing page."
            errors={e?.description}
          />
          <FormGrid cols={3}>
            <Select
              label="Property type"
              name="propertyType"
              defaultValue={initial?.propertyType ?? "hotel"}
              options={PROPERTY_TYPES.map((t) => ({
                value: t,
                label: t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              }))}
              errors={e?.propertyType}
            />
            <Select
              label="Official star class"
              name="starCategory"
              defaultValue={initial?.starCategory ?? 3}
              hint="The property's category, not the guest rating."
              options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n} star` }))}
              errors={e?.starCategory}
            />
            <TextInput
              label="Distance from centre (km)"
              name="distanceFromCenter"
              type="number"
              step={0.1}
              min={0}
              defaultValue={initial?.distanceFromCenter}
              errors={e?.distanceFromCenter}
            />
          </FormGrid>
        </div>
      </Card>

      <Card title="Where it is">
        <div className="space-y-4">
          <TextInput label="Street address" name="address" required defaultValue={initial?.address} placeholder="Kolatoli Beach Road" errors={e?.address} />
          <FormGrid cols={3}>
            <TextInput label="City" name="city" required defaultValue={initial?.city} placeholder="Cox's Bazar" errors={e?.city} />
            <TextInput label="Country" name="country" required defaultValue={initial?.country ?? "Bangladesh"} errors={e?.country} />
            <TextInput label="Area" name="location" required defaultValue={initial?.location} placeholder="Kolatoli Beach" hint="Shown on the search card." errors={e?.location} />
          </FormGrid>
          <FormGrid>
            <TextInput label="Latitude" name="latitude" type="number" step={0.000001} defaultValue={initial?.latitude} placeholder="21.4272" errors={e?.latitude} />
            <TextInput label="Longitude" name="longitude" type="number" step={0.000001} defaultValue={initial?.longitude} placeholder="92.0058" errors={e?.longitude} />
          </FormGrid>
        </div>
      </Card>

      <Card title="Photos" description="At least three are needed before you can submit for review.">
        <ImageUploader
          name="images"
          folder="hotels"
          scopeId={initial?._id ?? vendorId}
          initial={initial?.images ?? []}
          max={20}
        />
      </Card>

      <Card title="Amenities and tags">
        <div className="space-y-4">
          <ChipsInput label="Amenities" name="amenities" initial={initial?.amenities ?? []} suggestions={AMENITY_SUGGESTIONS} errors={e?.amenities} />
          <ChipsInput label="Tags" name="tags" initial={initial?.tags ?? []} suggestions={TAG_SUGGESTIONS} hint="Used for the quick filters on search." errors={e?.tags} />
        </div>
      </Card>

      <Card title="Policies">
        <div className="space-y-4">
          <FormGrid cols={3}>
            <TextInput label="Check-in time" name="checkInTime" required defaultValue={initial?.policies.checkInTime ?? "14:00"} placeholder="14:00" errors={e?.checkInTime} />
            <TextInput label="Check-out time" name="checkOutTime" required defaultValue={initial?.policies.checkOutTime ?? "12:00"} placeholder="12:00" errors={e?.checkOutTime} />
            <TextInput
              label="Free cancellation window (hours)"
              name="cancellationHours"
              type="number"
              min={0}
              required
              defaultValue={initial?.policies.cancellationHours ?? 24}
              hint="Hours before check-in."
              errors={e?.cancellationHours}
            />
          </FormGrid>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Toggle label="Children welcome" name="childrenAllowed" defaultChecked={initial?.policies.childrenAllowed ?? true} />
            <Toggle label="Pets allowed" name="petsAllowed" defaultChecked={initial?.policies.petsAllowed ?? false} />
          </div>
          <TextArea label="Other policy notes" name="extraNotes" rows={3} defaultValue={initial?.policies.extraNotes} placeholder="Government ID required at check-in. Extra bed available on request." errors={e?.extraNotes} />
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel="Saving...">
          {initial?._id ? (isPublished ? "Submit changes for review" : "Save property") : "Create property"}
        </SubmitButton>
        <Link href="/vendor/hotels" className="text-sm font-medium text-slate-500 hover:text-slate-700">
          Cancel
        </Link>
      </div>
    </form>
  );
}
