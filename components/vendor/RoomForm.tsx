"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveRoomAction } from "@/lib/actions/vendor";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";
import ImageUploader, { type UploadedImage } from "@/components/admin/ImageUploader";
import { ChipsInput, FormGrid, Select, TextArea, TextInput, Toggle } from "@/components/admin/Inputs";

const ROOM_AMENITIES = [
  "Air Conditioning", "Free WiFi", "Flat-screen TV", "Mini-bar", "Safe",
  "Balcony", "Sea View", "Bathtub", "Kettle", "Desk", "Iron",
];

export interface RoomOptionValue {
  code: string;
  label: string;
  description?: string;
  price: number;
  per: "night" | "stay";
  breakfast: boolean;
  refundable: boolean;
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
  pricingMode: "per_room" | "per_person";
  totalUnits: number;
  breakfast: boolean;
  refundable: boolean;
  cancellationHours: number;
  amenities: string[];
  images: UploadedImage[];
  options: RoomOptionValue[];
}

/** Turns "Airport return transfer" into "airport-return-transfer". */
function toCode(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30) || "extra";
}

const SUGGESTED: Omit<RoomOptionValue, "code">[] = [
  { label: "Breakfast", description: "Breakfast for the room, every morning.", price: 900, per: "night", breakfast: true, refundable: false, cancellationHours: 0 },
  { label: "Airport return transfer", description: "Pick-up and drop-off, both ways.", price: 2500, per: "stay", breakfast: false, refundable: false, cancellationHours: 0 },
  { label: "Free cancellation", description: "Cancel up to 24h before check-in for a full refund.", price: 800, per: "night", breakfast: false, refundable: true, cancellationHours: 24 },
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
  const [options, setOptions] = useState<RoomOptionValue[]>(initial?.options ?? []);
  const [refundable, setRefundable] = useState(initial?.refundable ?? true);
  const e = state.ok ? undefined : state.fieldErrors;

  const update = (i: number, patch: Partial<RoomOptionValue>) =>
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));

  const add = (preset?: Omit<RoomOptionValue, "code">) =>
    setOptions((prev) => {
      const draft = preset ?? {
        label: "New extra",
        description: "",
        price: 0,
        per: "night" as const,
        breakfast: false,
        refundable: false,
        cancellationHours: 0,
      };
      let code = toCode(draft.label);
      if (prev.some((o) => o.code === code)) code = `${code}-${prev.length + 1}`;
      return [...prev, { ...draft, code }];
    });

  const unused = SUGGESTED.filter((p) => !options.some((o) => o.code === toCode(p.label)));

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
      <input type="hidden" name="options" value={JSON.stringify(options)} readOnly />
      <ActionMessage state={state} />

      <FormGrid>
        <TextInput label="Room name" name="name" required defaultValue={initial?.name} placeholder="Deluxe Sea View" errors={e?.name} />
        <TextInput label="Bed configuration" name="bedType" required defaultValue={initial?.bedType} placeholder="1 King Bed" errors={e?.bedType} />
      </FormGrid>

      <TextArea label="Description" name="description" rows={3} defaultValue={initial?.description} placeholder="What is in this room and what makes it different from the others." errors={e?.description} />

      <FormGrid cols={3}>
        <TextInput
          label="Base price per night"
          name="basePrice"
          type="number"
          min={100}
          required
          prefix="৳"
          defaultValue={initial?.basePrice}
          hint="The one price for this room. Everything else is an extra below."
          errors={e?.basePrice}
        />
        <Select
          label="Charged"
          name="pricingMode"
          defaultValue={initial?.pricingMode ?? "per_room"}
          options={[
            { value: "per_room", label: "Per room, per night" },
            { value: "per_person", label: "Per guest, per night" },
          ]}
          hint="Per room unless your property genuinely sells by the head."
        />
        <TextInput
          label="How many rooms of this type"
          name="totalUnits"
          type="number"
          min={1}
          required
          defaultValue={initial?.totalUnits ?? 2}
          hint="Total physical rooms of this exact type — this is how many can be sold on any one night."
          errors={e?.totalUnits}
        />
      </FormGrid>

      <FormGrid cols={3}>
        <TextInput label="Max adults" name="maxAdults" type="number" min={1} required defaultValue={initial?.maxAdults ?? 2} errors={e?.maxAdults} />
        <TextInput label="Max children" name="maxChildren" type="number" min={0} required defaultValue={initial?.maxChildren ?? 0} errors={e?.maxChildren} />
        <TextInput label="Size (sqm)" name="sizeSqm" type="number" min={5} defaultValue={initial?.sizeSqm} errors={e?.sizeSqm} />
      </FormGrid>

      <div className="border border-slate-200 rounded-xl p-4 space-y-1">
        <p className="text-xs font-semibold text-slate-600 mb-2">What the base price includes</p>
        <Toggle
          label="Breakfast included"
          name="breakfast"
          defaultChecked={initial?.breakfast ?? false}
          hint="Leave off and sell breakfast as an extra instead."
        />
        {/* Hidden field for the same reason as the register form: React clears a
            controlled checkbox when it resets the form after an action. */}
        <input type="hidden" name="refundable" value={refundable ? "true" : "false"} readOnly />
        <label className="flex items-start gap-3 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={refundable}
            onChange={(ev) => setRefundable(ev.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-slate-300 text-brand-600 shrink-0"
          />
          <span>
            <span className="block text-sm font-medium text-slate-700">Free cancellation</span>
            <span className="block text-[11px] text-slate-400">
              Leave off to sell a non-refundable base rate and offer flexibility as an extra.
            </span>
          </span>
        </label>
        {refundable && (
          <div className="max-w-48 pt-1">
            <TextInput
              label="Free cancellation up to (hours before)"
              name="cancellationHours"
              type="number"
              min={0}
              defaultValue={initial?.cancellationHours ?? 24}
              errors={e?.cancellationHours}
            />
          </div>
        )}
      </div>

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
            <p className="text-xs font-semibold text-slate-600">Optional extras</p>
            <p className="text-[11px] text-slate-400">
              Added on top of the base price. A guest ticks the ones they want, one by one.
            </p>
          </div>
          <button
            type="button"
            onClick={() => add()}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            <Plus size={13} /> Add extra
          </button>
        </div>

        {e?.options && <p className="text-xs text-rose-600 mb-2">{e.options[0]}</p>}

        {unused.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {unused.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => add(preset)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Plus size={11} /> {preset.label}
              </button>
            ))}
          </div>
        )}

        {options.length === 0 ? (
          <p className="text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl px-4 py-6 text-center">
            No extras yet — guests just pay the base price.
          </p>
        ) : (
          <div className="space-y-2">
            {options.map((option, i) => (
              <div key={option.code} className="border border-slate-200 rounded-xl p-3 bg-slate-50/60">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Name</label>
                    <input
                      value={option.label}
                      onChange={(ev) => update(i, { label: ev.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Price</label>
                    <input
                      type="number"
                      min={0}
                      value={option.price}
                      onChange={(ev) => update(i, { price: Math.max(0, Number(ev.target.value) || 0) })}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-brand-500 tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Charged</label>
                    <select
                      value={option.per}
                      onChange={(ev) => update(i, { per: ev.target.value as "night" | "stay" })}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-brand-500 bg-white"
                    >
                      <option value="night">Per night</option>
                      <option value="stay">Once per stay</option>
                    </select>
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))}
                      aria-label={`Remove ${option.label}`}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <input
                  value={option.description ?? ""}
                  onChange={(ev) => update(i, { description: ev.target.value })}
                  placeholder="One line explaining what the guest gets (optional)"
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-brand-500 mt-2"
                />

                <div className="flex flex-wrap items-center gap-4 mt-2.5">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={option.breakfast}
                      onChange={(ev) => update(i, { breakfast: ev.target.checked })}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600"
                    />
                    Includes breakfast
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={option.refundable}
                      onChange={(ev) =>
                        update(i, {
                          refundable: ev.target.checked,
                          cancellationHours: ev.target.checked ? option.cancellationHours || 24 : 0,
                        })
                      }
                      className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600"
                    />
                    Makes the stay refundable
                  </label>
                  {option.refundable && (
                    <label className="flex items-center gap-1.5 text-xs text-slate-600">
                      Free cancel (h)
                      <input
                        type="number"
                        min={0}
                        value={option.cancellationHours}
                        onChange={(ev) => update(i, { cancellationHours: Number(ev.target.value) || 0 })}
                        className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-brand-500 tabular-nums"
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SubmitButton pendingLabel="Saving...">{initial?._id ? "Save room" : "Add room"}</SubmitButton>
    </form>
  );
}
