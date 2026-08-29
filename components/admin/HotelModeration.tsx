"use client";

import { useActionState, useState } from "react";
import { moderateHotelAction } from "@/lib/actions/admin";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "./SubmitBar";

type Decision = "approve" | "reject" | "suspend";

export default function HotelModeration({
  hotelId,
  status,
  hasRevision,
  imageCount,
}: {
  hotelId: string;
  status: string;
  hasRevision: boolean;
  imageCount: number;
}) {
  const [state, action] = useActionState(moderateHotelAction, idleState);
  const [decision, setDecision] = useState<Decision>(
    status === "published" ? (hasRevision ? "approve" : "suspend") : "approve",
  );
  const e = state.ok ? undefined : state.fieldErrors;

  const options: { value: Decision; label: string }[] =
    status === "published"
      ? hasRevision
        ? [
            { value: "approve", label: "Apply queued edit" },
            { value: "reject", label: "Reject edit" },
            { value: "suspend", label: "Suspend listing" },
          ]
        : [{ value: "suspend", label: "Suspend listing" }]
      : [
          { value: "approve", label: "Approve and publish" },
          { value: "reject", label: "Reject" },
        ];

  const needsReason = decision !== "approve";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="hotelId" value={hotelId} />
      <ActionMessage state={state} />

      {hasRevision && (
        <p className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          The partner has edits waiting. Approving applies them to the live listing.
        </p>
      )}
      {imageCount < 3 && status === "pending_review" && (
        <p className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          Only {imageCount} photo{imageCount === 1 ? "" : "s"} — below the usual bar of three.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="cursor-pointer select-none px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-brand-300 has-checked:bg-brand-600 has-checked:text-white has-checked:border-brand-600"
          >
            <input
              type="radio"
              name="decision"
              value={o.value}
              checked={decision === o.value}
              onChange={() => setDecision(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>

      <div>
        <label htmlFor="hm-note" className="block text-xs font-semibold text-slate-600 mb-1.5">
          Note {needsReason ? "(required)" : "(optional)"}
        </label>
        <textarea
          id="hm-note"
          name="note"
          rows={3}
          required={needsReason}
          placeholder={needsReason ? "What needs to change?" : "Optional internal note."}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 resize-y"
        />
        {e?.note && <p className="mt-1 text-xs text-rose-600">{e.note[0]}</p>}
      </div>

      <SubmitButton pendingLabel="Saving..." variant={needsReason ? "danger" : "primary"}>
        Confirm
      </SubmitButton>
    </form>
  );
}
