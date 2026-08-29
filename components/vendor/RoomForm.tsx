"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveRoomAction } from "@/lib/actions/vendor";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";
import ImageUploader, { type UploadedImage } from "@/components/admin/ImageUploader";
import { ChipsInput, FormGrid, TextArea, TextInput } from "@/components/admin/Inputs";

const ROOM_AMENITIES = [
  "Air Conditioning", "Free WiFi", "Flat-screen TV", "Mini-bar", "Safe",
  "Balcony", "Sea View", "Bathtub", "Kettle", "Desk", "Iron",
];

export interface RatePlanValue {
  code: string;
  name: string;
  breakfast: boolean;
  refundable: boolean;
  priceDelta: number;
  cancellationHours: number;
}

export interface RoomFormValues {
  _id?: string;
  name: string;
  description: string;
  bedType: string;
  sizeSqm?: number;
  maxAdults: number;
  maxChildren: number;
  basePrice: number;
  totalUnits: number;
  amenities: string[];
  images: UploadedImage[];
  ratePlans: RatePlanValue[];
}

const DEFAULT_PLANS: RatePlanValue[] = [
  { code: "room-only", name: "Room Only", breakfast: false, refundable: true, priceDelta: 0, cancellationHours: 24 },
];

export default function RoomForm({
  hotelId,
  initial,
  onDone,
}: {
  hotelId: string;
  initial?: RoomFormValues;
  onDone?: () => void;
}) {
  const [state, action] = useActionState(saveRoomAction, idleState);
  const [plans, setPlans] = useState<RatePlanValue[]>(initial?.ratePlans ?? DEFAULT_PLANS);
  const e = state.ok ? undefined : state.fieldErrors;

  const update = (i: number, patch: Partial<RatePlanValue>) =>
    setPlans((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const addPlan = () =>
    setPlans((prev) => [
      ...prev,
      {
        code: `plan-${prev.length + 1}`,
        name: "New rate plan",
        breakfast: false,
        refundable: true,
        priceDelta: 0,
        cancellationHours: 24,
      },
    ]);

  return (
    <form
      action={async (fd) => {
        await action(fd);
        onDone?.();
      }}
      className="space-y-5"
    >
      <input type="hidden" name="hotelId" value={hotelId} />
      {initial?._id && <input type="hidden" name="roomId" value={initial._id} />}
      <input type="hidden" name="ratePlans" value={JSON.stringify(plans)} readOnly />
      <ActionMessage state={state} />

      <FormGrid>
        <TextInput label="Room name" name="name" required defaultValue={initial?.name} placeholder="Deluxe Sea View" errors={e?.name} />
        <TextInput label="Bed configuration" name="bedType" required defaultValue={initial?.bedType} placeholder="1 King Bed" errors={e?.bedType} />
      </FormGrid>

      <TextArea label="Description" name="description" rows={3} defaultValue={initial?.description} placeholder="What is in this room and what makes it different from the others." errors={e?.description} />

      <FormGrid cols={3}>
        <TextInput label="Base price per night" name="basePrice" type="number" min={100} required prefix="৳" defaultValue={initial?.basePrice} errors={e?.basePrice} />
        <TextInput label="How many of this room" name="totalUnits" type="number" min={1} required defaultValue={initial?.totalUnits ?? 1} hint="Physical rooms of this type." errors={e?.totalUnits} />
        <TextInput label="Size (sqm)" name="sizeSqm" type="number" min={5} defaultValue={initial?.sizeSqm} errors={e?.sizeSqm} />
      </FormGrid>

      <FormGrid>
        <TextInput label="Max adults" name="maxAdults" type="number" min={1} required defaultValue={initial?.maxAdults ?? 2} errors={e?.maxAdults} />
        <TextInput label="Max children" name="maxChildren" type="number" min={0} required defaultValue={initial?.maxChildren ?? 0} errors={e?.maxChildren} />
      </FormGrid>

      <ChipsInput label="Room amenities" name="amenities" initial={initial?.amenities ?? []} suggestions={ROOM_AMENITIES} errors={e?.amenities} />

      <ImageUploader
        name="images"
        folder="rooms"
        scopeId={initial?._id ?? hotelId}
        initial={initial?.images ?? []}
        max={8}
        label="Room photos"
        hint="First image shows on the room list."
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-slate-600">Rate plans</p>
            <p className="text-[11px] text-slate-400">
              Each plan is a separate price a guest can pick — with or without breakfast, refundable or not.
            </p>
          </div>
          <button
            type="button"
            onClick={addPlan}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            <Plus size={13} /> Add plan
          </button>
        </div>

        {e?.ratePlans && <p className="text-xs text-rose-600 mb-2">{e.ratePlans[0]}</p>}

        <div className="space-y-2">
          {plans.map((plan, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-3 bg-slate-50/60">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Name</label>
                  <input
                    value={plan.name}
                    onChange={(ev) => update(i, { name: ev.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Price change</label>
                  <input
                    type="number"
                    value={plan.priceDelta}
                    onChange={(ev) => update(i, { priceDelta: Number(ev.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-brand-500 tabular-nums"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Free cancel (h)</label>
                  <input
                    type="number"
                    min={0}
                    disabled={!plan.refundable}
                    value={plan.cancellationHours}
                    onChange={(ev) => update(i, { cancellationHours: Number(ev.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-brand-500 tabular-nums disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  {plans.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPlans((prev) => prev.filter((_, idx) => idx !== i))}
                      aria-label={`Remove ${plan.name}`}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-2.5">
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plan.breakfast}
                    onChange={(ev) => update(i, { breakfast: ev.target.checked })}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600"
                  />
                  Breakfast included
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plan.refundable}
                    onChange={(ev) =>
                      update(i, {
                        refundable: ev.target.checked,
                        cancellationHours: ev.target.checked ? plan.cancellationHours || 24 : 0,
                      })
                    }
                    className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600"
                  />
                  Refundable
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SubmitButton pendingLabel="Saving...">{initial?._id ? "Save room" : "Add room"}</SubmitButton>
    </form>
  );
}
