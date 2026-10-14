"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import { idleState } from "@/lib/actions/_result";
import { Field, FormMessage } from "@/components/auth/Field";
import SubmitButton from "@/components/auth/SubmitButton";

export default function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action] = useActionState(loginAction, idleState);
  // Controlled so React 19's post-action form reset keeps the email after a failed sign-in.
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="space-y-4">
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
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

      <Field
        label="Password"
        name="password"
        type="password"
        icon={Lock}
        placeholder="Enter your password"
        autoComplete="current-password"
        errors={state.ok ? undefined : state.fieldErrors?.password}
        labelAction={
          <Link
            href="/auth/forgot-password"
            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            Forgot password?
          </Link>
        }
      />

      <SubmitButton pendingLabel="Signing in...">Sign In</SubmitButton>
    </form>
  );
}
