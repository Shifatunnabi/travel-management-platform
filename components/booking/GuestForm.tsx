"use client";

import { useActionState } from "react";
import { User, Mail, Phone } from "lucide-react";
import { saveGuestDetailsAction } from "@/lib/actions/booking";
import { idleState } from "@/lib/actions/_result";
import { Field, FormMessage } from "@/components/auth/Field";
import SubmitButton from "@/components/auth/SubmitButton";

export default function GuestForm({
  bookingRef,
  initial,
}: {
  bookingRef: string;
  initial: { fullName: string; email: string; phone: string; specialRequests: string };
}) {
  const [state, action] = useActionState(saveGuestDetailsAction, idleState);
  const e = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="ref" value={bookingRef} />
      <FormMessage state={state} />

      <Field
        label="Lead guest name"
        name="fullName"
        icon={User}
        placeholder="As it appears on their ID"
        defaultValue={initial.fullName}
        autoComplete="name"
        errors={e?.fullName}
      />
      <Field
        label="Email address"
        name="email"
        type="email"
        icon={Mail}
        placeholder="you@email.com"
        defaultValue={initial.email}
        autoComplete="email"
        errors={e?.email}
      />
      <Field
        label="Phone number"
        name="phone"
        type="tel"
        icon={Phone}
        placeholder="+880 1XXX-XXXXXX"
        defaultValue={initial.phone}
        autoComplete="tel"
        errors={e?.phone}
      />

      <div>
        <label htmlFor="requests" className="block text-xs font-semibold text-slate-600 mb-1.5">
          Special requests <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="requests"
          name="specialRequests"
          rows={3}
          defaultValue={initial.specialRequests}
          placeholder="Late arrival, high floor, extra bed — the property will do its best."
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-y"
        />
        <p className="mt-1 text-[11px] text-slate-400">Requests are not guaranteed.</p>
      </div>

      <SubmitButton pendingLabel="Saving...">Continue to payment</SubmitButton>
    </form>
  );
}
