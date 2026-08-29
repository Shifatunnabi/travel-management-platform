"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { idleState } from "@/lib/actions/_result";
import { Field, FormMessage } from "@/components/auth/Field";
import SubmitButton from "@/components/auth/SubmitButton";

export default function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, idleState);

  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <Field
        label="Email Address"
        name="email"
        type="email"
        icon={Mail}
        placeholder="you@email.com"
        autoComplete="email"
        errors={state.ok ? undefined : state.fieldErrors?.email}
      />
      <SubmitButton pendingLabel="Sending link...">Send reset link</SubmitButton>
    </form>
  );
}
