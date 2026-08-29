"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { resetPasswordAction } from "@/lib/actions/auth";
import { idleState } from "@/lib/actions/_result";
import { Field, FormMessage } from "@/components/auth/Field";
import SubmitButton from "@/components/auth/SubmitButton";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, idleState);
  const done = state.ok && Boolean(state.message);

  if (done) {
    return (
      <div className="space-y-4">
        <FormMessage state={state} />
        <Link
          href="/auth/login"
          className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <Field
        label="New Password"
        name="password"
        type="password"
        icon={Lock}
        placeholder="At least 8 characters"
        autoComplete="new-password"
        errors={state.ok ? undefined : state.fieldErrors?.password}
      />
      <Field
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        icon={Lock}
        placeholder="Re-enter your password"
        autoComplete="new-password"
        errors={state.ok ? undefined : state.fieldErrors?.confirmPassword}
      />
      <SubmitButton pendingLabel="Updating...">Update password</SubmitButton>
    </form>
  );
}
