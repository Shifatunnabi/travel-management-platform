"use client";

import { useActionState } from "react";
import { createStaffAction } from "@/lib/actions/admin";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "./SubmitBar";
import { Select, TextInput } from "./Inputs";
import { PLATFORM_ROLES } from "@/lib/models/types";

export default function StaffForm() {
  const [state, action] = useActionState(createStaffAction, idleState);
  const e = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={action} className="space-y-4">
      <ActionMessage state={state} />
      <TextInput label="Full name" name="name" required errors={e?.name} />
      <TextInput label="Email" name="email" type="email" required errors={e?.email} />
      <Select
        label="Role"
        name="platformRole"
        defaultValue="ops"
        options={PLATFORM_ROLES.map((r) => ({
          value: r,
          label: r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        }))}
        errors={e?.platformRole}
      />
      <TextInput
        label="Temporary password"
        name="password"
        type="password"
        required
        hint="Share it securely; they can change it from the reset flow."
        errors={e?.password}
      />
      <SubmitButton pendingLabel="Creating...">Create account</SubmitButton>
    </form>
  );
}
