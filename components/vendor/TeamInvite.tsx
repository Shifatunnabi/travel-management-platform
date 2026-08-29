"use client";

import { useActionState } from "react";
import { inviteTeamMemberAction } from "@/lib/actions/team";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";
import { Select, TextInput } from "@/components/admin/Inputs";

export default function TeamInvite() {
  const [state, action] = useActionState(inviteTeamMemberAction, idleState);
  const e = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={action} className="space-y-4">
      <ActionMessage state={state} />
      <TextInput label="Name" name="name" required errors={e?.name} />
      <TextInput label="Email" name="email" type="email" required errors={e?.email} />
      <Select
        label="Role"
        name="role"
        defaultValue="staff"
        options={[
          { value: "manager", label: "Manager — properties, rates, bookings" },
          { value: "staff", label: "Staff — bookings and check-in" },
        ]}
        errors={e?.role}
      />
      <SubmitButton pendingLabel="Inviting...">Send invitation</SubmitButton>
      <p className="text-[11px] text-slate-400">
        They receive an email to set their own password. No password is ever sent in plain text.
      </p>
    </form>
  );
}
