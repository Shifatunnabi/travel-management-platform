"use client";

import { useActionState, useState } from "react";
import { moderateReviewAction } from "@/lib/actions/admin";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "./SubmitBar";

type Decision = "publish" | "reject" | "hide";

export default function ReviewModeration({
  reviewId,
  status,
}: {
  reviewId: string;
  status: string;
}) {
  const [state, action] = useActionState(moderateReviewAction, idleState);
  const [decision, setDecision] = useState<Decision>(status === "published" ? "hide" : "publish");
  const e = state.ok ? undefined : state.fieldErrors;

  const options: { value: Decision; label: string }[] =
    status === "published"
      ? [{ value: "hide", label: "Hide" }, { value: "reject", label: "Reject" }]
      : [
          { value: "publish", label: "Publish" },
          { value: "reject", label: "Reject" },
        ];

  const needsReason = decision !== "publish";

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="reviewId" value={reviewId} />
      <ActionMessage state={state} />

      <div className="flex gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="flex-1 text-center cursor-pointer select-none px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-brand-300 has-checked:bg-brand-600 has-checked:text-white has-checked:border-brand-600"
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

      {needsReason && (
        <div>
          <input
            name="reason"
            required
            placeholder="Reason — the reviewer sees this"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          {e?.reason && <p className="mt-1 text-xs text-rose-600">{e.reason[0]}</p>}
        </div>
      )}

      <SubmitButton pendingLabel="Saving..." size="sm" variant={needsReason ? "danger" : "primary"} className="w-full">
        Confirm
      </SubmitButton>
    </form>
  );
}
