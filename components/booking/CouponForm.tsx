"use client";

import { useActionState, useTransition } from "react";
import { Tag, X, Check } from "lucide-react";
import { applyCouponAction, removeCouponAction } from "@/lib/actions/booking";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";
import { formatCurrency } from "@/lib/utils/formatters";

export default function CouponForm({
  bookingRef,
  appliedCode,
  discount,
}: {
  bookingRef: string;
  appliedCode: string | null;
  discount: number;
}) {
  const [state, action] = useActionState(applyCouponAction, idleState);
  const [pending, start] = useTransition();

  if (appliedCode && discount > 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
        <Check size={16} className="text-emerald-600 shrink-0" aria-hidden="true" />
        <p className="flex-1 text-sm text-emerald-900">
          <span className="font-semibold">{appliedCode}</span> applied —{" "}
          {formatCurrency(discount)} off
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() => start(async () => void (await removeCouponAction(bookingRef)))}
          aria-label="Remove coupon"
          className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="ref" value={bookingRef} />
      <ActionMessage state={state} />
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            name="code"
            required
            placeholder="Enter code"
            aria-label="Promo code"
            className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brand-500 uppercase"
          />
        </div>
        <SubmitButton pendingLabel="Checking..." variant="secondary">Apply</SubmitButton>
      </div>
    </form>
  );
}
