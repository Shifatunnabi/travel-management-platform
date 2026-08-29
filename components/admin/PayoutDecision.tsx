"use client";

import { useActionState, useState } from "react";
import { decidePayoutAction } from "@/lib/actions/payout";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "./SubmitBar";
import { formatCurrency } from "@/lib/utils/formatters";

type Decision = "approve" | "reject" | "mark_paid";

export default function PayoutDecision({
  payoutId,
  status,
  requestedAmount,
  available,
  bankVerified,
}: {
  payoutId: string;
  status: string;
  requestedAmount: number;
  available: number;
  bankVerified: boolean;
}) {
  const [state, action] = useActionState(decidePayoutAction, idleState);
  const [decision, setDecision] = useState<Decision>(
    status === "approved" ? "mark_paid" : "approve",
  );
  const e = state.ok ? undefined : state.fieldErrors;

  if (status === "paid" || status === "rejected") {
    return (
      <div className="text-sm text-slate-500">
        {status === "paid" ? "Settled." : "Closed."}
      </div>
    );
  }

  const options: { value: Decision; label: string }[] =
    status === "approved"
      ? [{ value: "mark_paid", label: "Mark paid" }, { value: "reject", label: "Reject" }]
      : [{ value: "approve", label: "Approve" }, { value: "reject", label: "Reject" }];

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="payoutId" value={payoutId} />
      <ActionMessage state={state} />

      {!bankVerified && decision === "approve" && (
        <p className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-800">
          Verify the vendor&apos;s bank account before approving.
        </p>
      )}

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

      {decision === "approve" && (
        <div>
          <label htmlFor={`amt-${payoutId}`} className="block text-xs font-semibold text-slate-600 mb-1">
            Approve amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">৳</span>
            <input
              id={`amt-${payoutId}`}
              name="approvedAmount"
              type="number"
              min={1}
              max={Math.max(requestedAmount, available)}
              defaultValue={requestedAmount}
              className="w-full border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-sm outline-none focus:border-brand-500 tabular-nums"
            />
          </div>
          {e?.approvedAmount ? (
            <p className="mt-1 text-xs text-rose-600">{e.approvedAmount[0]}</p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-400">
              Ledger supports {formatCurrency(available)}.
            </p>
          )}
        </div>
      )}

      {decision === "mark_paid" && (
        <div>
          <label htmlFor={`ref-${payoutId}`} className="block text-xs font-semibold text-slate-600 mb-1">
            Bank reference
          </label>
          <input
            id={`ref-${payoutId}`}
            name="reference"
            required
            placeholder="Transfer or bKash reference"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          {e?.reference && <p className="mt-1 text-xs text-rose-600">{e.reference[0]}</p>}
        </div>
      )}

      {decision === "reject" && (
        <div>
          <input
            name="reason"
            required
            placeholder="Reason — the partner sees this"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          {e?.reason && <p className="mt-1 text-xs text-rose-600">{e.reason[0]}</p>}
        </div>
      )}

      <SubmitButton
        pendingLabel="Saving..."
        variant={decision === "reject" ? "danger" : "primary"}
        className="w-full"
      >
        Confirm
      </SubmitButton>
    </form>
  );
}
