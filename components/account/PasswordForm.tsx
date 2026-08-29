"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/lib/actions/auth";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";
import { FormGrid, TextInput } from "@/components/admin/Inputs";

export default function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, idleState);
  const e = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={action} className="space-y-4">
      <ActionMessage state={state} />
      <TextInput
        label="Current password"
        name="currentPassword"
        type="password"
        required
        errors={e?.currentPassword}
      />
      <FormGrid>
        <TextInput
          label="New password"
          name="password"
          type="password"
          required
          hint="At least 8 characters, with upper, lower and a number."
          errors={e?.password}
        />
        <TextInput
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          required
          errors={e?.confirmPassword}
        />
      </FormGrid>
      <SubmitButton pendingLabel="Updating...">Change password</SubmitButton>
    </form>
  );
}
