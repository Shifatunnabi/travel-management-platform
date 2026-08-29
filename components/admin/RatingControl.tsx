"use client";

import { useActionState, useState } from "react";
import { adjustRatingAction } from "@/lib/actions/admin";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "./SubmitBar";
import type { RatingAdjustmentMode } from "@/lib/models/types";

const clamp = (n: number) => Math.min(5, Math.max(0, n));

export default function RatingControl({
  hotelId, mode: initialMode, value: initialValue, seedCount: initialSeed,
  reason: initialReason, trueAvg, trueCount, maxOffset,
}: {
  hotelId: string;
  mode: RatingAdjustmentMode;
  value: number;
  seedCount: number;
  reason: string;
  trueAvg: number;
  trueCount: number;
  maxOffset: number;
}) {
  const [state, action] = useActionState(adjustRatingAction, idleState);
  const [mode, setMode] = useState<RatingAdjustmentMode>(initialMode);
  const [value, setValue] = useState(initialValue);
  const [seed, setSeed] = useState(initialSeed);
  const e = state.ok ? undefined : state.fieldErrors;

  // Mirrors deriveDisplayRating on the server so the preview cannot drift.
  const preview =
    mode === "override" ? clamp(value) : mode === "offset" ? clamp(trueAvg === 0 ? value : trueAvg + value) : trueAvg;
  const previewCount = trueCount + (mode === "none" ? 0 : seed);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="hotelId" value={hotelId} />
      <ActionMessage state={state} />

      <div>
        <span className="block text-xs font-semibold text-slate-600 mb-1.5">Adjustment</span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["none", "Show the true average"],
              ["offset", "Nudge by an amount"],
              ["override", "Set an exact value"],
            ] as [RatingAdjustmentMode, string][]
          ).map(([m, label]) => (
            <label
              key={m}
              className="cursor-pointer select-none px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-brand-300 has-checked:bg-brand-600 has-checked:text-white has-checked:border-brand-600"
            >
              <input
                type="radio"
                name="mode"
                value={m}
                checked={mode === m}
                onChange={() => setMode(m)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {mode !== "none" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rc-value" className="block text-xs font-semibold text-slate-600 mb-1.5">
                {mode === "override" ? "Displayed rating" : "Offset"}
              </label>
              <input
                id="rc-value"
                name="value"
                type="number"
                step={0.1}
                min={mode === "override" ? 1 : -maxOffset}
                max={mode === "override" ? 5 : maxOffset}
                value={value}
                onChange={(ev) => setValue(Number(ev.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 tabular-nums"
              />
              {e?.value ? (
                <p className="mt-1 text-xs text-rose-600">{e.value[0]}</p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-400">
                  {mode === "override" ? "Between 1.0 and 5.0." : `Between -${maxOffset} and +${maxOffset}.`}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="rc-seed" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Add to the review count
              </label>
              <input
                id="rc-seed"
                name="seedCount"
                type="number"
                min={0}
                value={seed}
                onChange={(ev) => setSeed(Number(ev.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 tabular-nums"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Changes the number only. No review text is ever generated.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="rc-reason" className="block text-xs font-semibold text-slate-600 mb-1.5">
              Reason (required)
            </label>
            <input
              id="rc-reason"
              name="reason"
              defaultValue={initialReason}
              placeholder="e.g. Launch partner placement, Q3 campaign"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500"
            />
            {e?.reason && <p className="mt-1 text-xs text-rose-600">{e.reason[0]}</p>}
          </div>
        </>
      )}

      <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 flex flex-wrap items-center gap-x-8 gap-y-2">
        <div>
          <p className="text-[11px] text-slate-500">True</p>
          <p className="font-bold text-slate-700 tabular-nums">
            {trueCount ? trueAvg.toFixed(2) : "—"} <span className="font-normal text-slate-400">({trueCount})</span>
          </p>
        </div>
        <span className="text-slate-300" aria-hidden="true">→</span>
        <div>
          <p className="text-[11px] text-slate-500">Will display</p>
          <p className={`font-bold tabular-nums ${mode === "none" ? "text-slate-700" : "text-amber-600"}`}>
            {previewCount || mode !== "none" ? preview.toFixed(1) : "—"}{" "}
            <span className="font-normal text-slate-400">({previewCount})</span>
          </p>
        </div>
      </div>

      <SubmitButton pendingLabel="Saving...">
        {mode === "none" ? "Clear adjustment" : "Apply adjustment"}
      </SubmitButton>
    </form>
  );
}
