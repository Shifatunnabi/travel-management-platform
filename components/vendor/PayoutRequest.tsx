"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPayoutAction } from "@/lib/actions/payout";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";
import { formatCurrency } from "@/lib/utils/formatters";

export default function PayoutRequest({
  withdrawable,
  minimum,
  bankVerified,
  hasBank,
}: {
  withdrawable: number;
  minimum: number;
  bankVerified: boolean;
  hasBank: boolean;
}) {
  const [state, action] = useActionState(requestPayoutAction, idleState);
  const e = state.ok ? undefined : state.fieldErrors;

  if (!hasBank) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
        Add your payout account in{" "}
        <Link href="/vendor/settings" className="font-semibold underline">
          Settings
        </Link>{" "}
        before requesting money.
      </div>
    );
  }

  if (!bankVerified) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
        Your bank details are with the platform team for verification. Requests open once that is
        done.
      </div>
    );
  }

  if (withdrawable < minimum) {
    return (
      <div className="text-sm text-slate-500">
        <p>
          You can withdraw <strong className="text-slate-800">{formatCurrency(withdrawable)}</strong>.
        </p>
        <p className="mt-1 text-xs">
          The smallest disbursement is {formatCurrency(minimum)}. Earnings become available once
          their settlement window passes.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <ActionMessage state={state} />
      <div>
        <label htmlFor="payout-amount" className="block text-xs font-semibold text-slate-600 mb-1.5">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">৳</span>
          <input
            id="payout-amount"
            name="amount"
            type="number"
            min={minimum}
            max={withdrawable}
            defaultValue={withdrawable}
            required
            className="w-full border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-sm outline-none focus:border-brand-500 tabular-nums"
          />
        </div>
        {e?.amount ? (
          <p className="mt-1 text-xs text-rose-600">{e.amount[0]}</p>
        ) : (
          <p className="mt-1 text-[11px] text-slate-400">
            Up to {formatCurrency(withdrawable)} available.
          </p>
        )}
      </div>
      <SubmitButton pendingLabel="Requesting...">Request disbursement</SubmitButton>
    </form>
  );
}
