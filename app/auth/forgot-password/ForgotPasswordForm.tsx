"use client";

import { useActionState, useState } from "react";
import { Mail } from "lucide-react";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { idleState } from "@/lib/actions/_result";
import { Field, FormMessage } from "@/components/auth/Field";
import SubmitButton from "@/components/auth/SubmitButton";

export default function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, idleState);
  // Controlled so React 19's post-action form reset keeps the email after a rejection.
  const [email, setEmail] = useState("");

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
        value={email}
        onValueChange={setEmail}
        errors={state.ok ? undefined : state.fieldErrors?.email}
      />
      <SubmitButton pendingLabel="Sending link...">Send reset link</SubmitButton>
    </form>
  );
}
