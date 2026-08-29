"use client";

import { useActionState, useState } from "react";
import { cancelBookingAction } from "@/lib/actions/booking";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";
import { formatCurrency } from "@/lib/utils/formatters";

export default function CancelBooking({
  bookingRef,
  refundAmount,
  free,
}: {
  bookingRef: string;
  refundAmount: number;
  free: boolean;
}) {
  const [state, action] = useActionState(cancelBookingAction, idleState);
  const [open, setOpen] = useState(false);

  if (state.message) {
    return <ActionMessage state={state} />;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
      >
        Cancel booking
      </button>
    );
  }

  return (
    <form action={action} className="w-full space-y-2">
      <input type="hidden" name="ref" value={bookingRef} />
      <p className={`text-[11px] ${free ? "text-emerald-600" : "text-amber-600"}`}>
        {free
          ? `Free cancellation — ${formatCurrency(refundAmount)} refunded.`
          : "Outside the free-cancellation window: no refund is due."}
      </p>
      <input
        name="reason"
        required
        minLength={3}
        placeholder="Reason"
        aria-label="Cancellation reason"
        className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-brand-500"
      />
      <div className="flex gap-2">
        <SubmitButton pendingLabel="Cancelling..." variant="danger" size="sm">Confirm</SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2"
        >
          Keep it
        </button>
      </div>
    </form>
  );
}
