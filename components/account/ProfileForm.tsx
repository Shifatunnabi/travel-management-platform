"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/auth";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";
import { FormGrid, TextInput } from "@/components/admin/Inputs";

export default function ProfileForm({
  initial,
}: {
  initial: {
    name: string;
    email: string;
    phone: string;
    nationality: string;
    dateOfBirth: string;
  };
}) {
  const [state, action] = useActionState(updateProfileAction, idleState);
  const e = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={action} className="space-y-4">
      <ActionMessage state={state} />
      <FormGrid>
        <TextInput label="Full name" name="name" required defaultValue={initial.name} errors={e?.name} />
        <TextInput
          label="Email"
          name="email"
          type="email"
          required={false}
          defaultValue={initial.email}
          hint="Contact support to change the address you sign in with."
        />
      </FormGrid>
      <FormGrid cols={3}>
        <TextInput label="Phone" name="phone" type="tel" required defaultValue={initial.phone} errors={e?.phone} />
        <TextInput label="Nationality" name="nationality" required={false} defaultValue={initial.nationality} placeholder="Bangladeshi" errors={e?.nationality} />
        <TextInput label="Date of birth" name="dateOfBirth" type="date" required={false} defaultValue={initial.dateOfBirth} errors={e?.dateOfBirth} />
      </FormGrid>
      <SubmitButton pendingLabel="Saving...">Save changes</SubmitButton>
    </form>
  );
}
