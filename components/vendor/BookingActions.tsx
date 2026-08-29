"use client";

import { useActionState, useState } from "react";
import { LogIn, LogOut, UserX, Ban } from "lucide-react";
import { updateBookingStatusAction } from "@/lib/actions/vendor-bookings";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";

export default function BookingActions({
  bookingRef,
  status,
}: {
  bookingRef: string;
  status: string;
}) {
  const [state, action] = useActionState(updateBookingStatusAction, idleState);
  const [cancelling, setCancelling] = useState(false);

  if (state.message) return <ActionMessage state={state} />;

  const quick: { action: string; label: string; icon: typeof LogIn }[] =
    status === "confirmed"
      ? [
          { action: "check_in", label: "Check in", icon: LogIn },
          { action: "no_show", label: "No show", icon: UserX },
        ]
      : status === "checked_in"
        ? [{ action: "check_out", label: "Check out", icon: LogOut }]
        : [];

  if (cancelling) {
    return (
      <form action={action} className="space-y-2 text-left">
        <input type="hidden" name="ref" value={bookingRef} />
        <input type="hidden" name="action" value="cancel" />
        <input
          name="reason"
          required
          placeholder="Reason for the guest"
          aria-label="Cancellation reason"
          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-brand-500"
        />
        <div className="flex gap-2 justify-end">
          <SubmitButton pendingLabel="Cancelling..." variant="danger" size="sm">Confirm</SubmitButton>
          <button
            type="button"
            onClick={() => setCancelling(false)}
            className="text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            Back
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {quick.map(({ action: a, label, icon: Icon }) => (
        <form key={a} action={action}>
          <input type="hidden" name="ref" value={bookingRef} />
          <input type="hidden" name="action" value={a} />
          <button
            type="submit"
            title={label}
            className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
          >
            <Icon size={15} />
          </button>
        </form>
      ))}
      {(status === "confirmed" || status === "checked_in") && (
        <button
          type="button"
          onClick={() => setCancelling(true)}
          title="Cancel booking"
          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <Ban size={15} />
        </button>
      )}
    </div>
  );
}
