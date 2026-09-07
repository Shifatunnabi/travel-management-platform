"use client";

import { useActionState } from "react";
import { becomePartnerAction } from "@/lib/actions/auth";
import { idleState } from "@/lib/actions/_result";
import { FormMessage } from "@/components/auth/Field";
import SubmitButton from "@/components/auth/SubmitButton";

/** Adds a business to the account the traveller is already signed in with. */
export default function BecomePartnerForm({ name, email }: { name: string; email: string }) {
  const [state, action] = useActionState(becomePartnerAction, idleState);

  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
        <p className="text-xs text-slate-500">Signed in as</p>
        <p className="font-semibold text-slate-800 text-sm">{name}</p>
        <p className="text-xs text-slate-500">{email}</p>
      </div>
      <p className="text-sm text-slate-600">
        You can list properties under this account — your existing bookings and trips stay exactly
        where they are.
      </p>
      <SubmitButton pendingLabel="Setting up...">Continue as a partner</SubmitButton>
    </form>
  );
}
