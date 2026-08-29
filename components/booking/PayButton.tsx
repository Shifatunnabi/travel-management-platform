"use client";

import { useActionState, useEffect } from "react";
import { Loader2, Lock } from "lucide-react";
import { useFormStatus } from "react-dom";
import { payBookingAction } from "@/lib/actions/booking";
import type { ActionState } from "@/lib/actions/_result";

const initial: ActionState<{ gatewayUrl: string }> = { ok: true };
import { formatCurrency } from "@/lib/utils/formatters";

export default function PayButton({
  bookingRef,
  amount,
}: {
  bookingRef: string;
  amount: number;
}) {
  const [state, action] = useActionState(payBookingAction, initial);

  // The gateway URL is created server-side; the browser only follows it.
  useEffect(() => {
    if (state.ok && state.data?.gatewayUrl) {
      window.location.assign(state.data.gatewayUrl);
    }
  }, [state]);

  return (
    <form action={action}>
      <input type="hidden" name="ref" value={bookingRef} />
      {!state.ok && state.message && (
        <div role="alert" className="mb-3 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </div>
      )}
      <Inner amount={amount} redirecting={state.ok && Boolean(state.data?.gatewayUrl)} />
    </form>
  );
}

function Inner({ amount, redirecting }: { amount: number; redirecting: boolean }) {
  const { pending } = useFormStatus();
  const busy = pending || redirecting;

  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-70"
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
      {busy ? "Taking you to the gateway..." : `Pay ${formatCurrency(amount)}`}
    </button>
  );
}
