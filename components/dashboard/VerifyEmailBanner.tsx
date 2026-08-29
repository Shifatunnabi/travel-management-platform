"use client";

import { useActionState } from "react";
import { MailWarning } from "lucide-react";
import { resendVerificationAction } from "@/lib/actions/auth";
import { idleState, type ActionState } from "@/lib/actions/_result";

export default function VerifyEmailBanner({ email }: { email: string }) {
  const [state, action, pending] = useActionState(
    async (): Promise<ActionState> => resendVerificationAction(),
    idleState,
  );

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
      <MailWarning size={20} className="text-amber-600 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm text-amber-900">
        {state.message ?? (
          <>
            Confirm <span className="font-semibold">{email}</span> so we can send your booking
            vouchers. Your account works either way.
          </>
        )}
      </p>
      {!state.message && (
        <form action={action}>
          <button
            type="submit"
            disabled={pending}
            className="text-sm font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-700 disabled:opacity-50"
          >
            {pending ? "Sending..." : "Resend email"}
          </button>
        </form>
      )}
    </div>
  );
}
