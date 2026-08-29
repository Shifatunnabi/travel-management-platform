"use client";

import { useActionState, useState } from "react";
import { decideVendorAction } from "@/lib/actions/admin";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "./SubmitBar";

type Decision = "approve" | "reject" | "suspend" | "reinstate";

export default function VendorDecision({
  vendorId,
  status,
  commissionPct,
}: {
  vendorId: string;
  status: string;
  commissionPct: number | null;
}) {
  const [state, action] = useActionState(decideVendorAction, idleState);
  const [decision, setDecision] = useState<Decision>(
    status === "approved" ? "suspend" : status === "suspended" ? "reinstate" : "approve",
  );
  const e = state.ok ? undefined : state.fieldErrors;

  const options: { value: Decision; label: string; tone: string }[] =
    status === "approved"
      ? [{ value: "suspend", label: "Suspend", tone: "text-rose-700 border-rose-200 has-checked:bg-rose-600" }]
      : status === "suspended"
        ? [{ value: "reinstate", label: "Reinstate", tone: "text-emerald-700 border-emerald-200 has-checked:bg-emerald-600" }]
        : [
            { value: "approve", label: "Approve", tone: "text-emerald-700 border-emerald-200 has-checked:bg-emerald-600" },
            { value: "reject", label: "Reject", tone: "text-rose-700 border-rose-200 has-checked:bg-rose-600" },
          ];

  const needsReason = decision === "reject";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="vendorId" value={vendorId} />
      <ActionMessage state={state} />

      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={`cursor-pointer select-none px-3 py-2 rounded-xl border text-sm font-semibold transition-colors has-checked:text-white ${o.tone}`}
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

      {(decision === "approve" || status === "approved") && (
        <div>
          <label htmlFor="commission" className="block text-xs font-semibold text-slate-600 mb-1.5">
            Commission rate
          </label>
          <div className="relative">
            <input
              id="commission"
              name="commissionPct"
              type="number"
              min={0}
              max={100}
              step={0.5}
              defaultValue={commissionPct ?? ""}
              placeholder="Platform default"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-8 text-sm outline-none focus:border-brand-500 tabular-nums"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
          </div>
          {e?.commissionPct ? (
            <p className="mt-1 text-xs text-rose-600">{e.commissionPct[0]}</p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-400">Leave blank to use the platform default.</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="note" className="block text-xs font-semibold text-slate-600 mb-1.5">
          Note {needsReason ? "(required)" : "(optional)"}
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          required={needsReason}
          placeholder={
            needsReason
              ? "What does the partner need to fix before reapplying?"
              : "Internal note, also emailed to the partner."
          }
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 resize-y"
        />
        {e?.note && <p className="mt-1 text-xs text-rose-600">{e.note[0]}</p>}
      </div>

      <SubmitButton
        pendingLabel="Saving..."
        variant={decision === "reject" || decision === "suspend" ? "danger" : "primary"}
      >
        Confirm {decision}
      </SubmitButton>
    </form>
  );
}
