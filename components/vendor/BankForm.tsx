"use client";

import { useActionState } from "react";
import { saveBankDetailsAction } from "@/lib/actions/vendor";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";
import { FormGrid, TextInput } from "@/components/admin/Inputs";

export default function BankForm({
  initial,
}: {
  initial: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branch: string;
    routingNumber: string;
  };
}) {
  const [state, action] = useActionState(saveBankDetailsAction, idleState);
  const e = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={action} className="space-y-4">
      <ActionMessage state={state} />
      <FormGrid>
        <TextInput label="Account name" name="accountName" required defaultValue={initial.accountName} errors={e?.accountName} />
        <TextInput label="Account number" name="accountNumber" required defaultValue={initial.accountNumber} hint="Changing this needs re-verification before the next payout." errors={e?.accountNumber} />
      </FormGrid>
      <FormGrid cols={3}>
        <TextInput label="Bank" name="bankName" required defaultValue={initial.bankName} errors={e?.bankName} />
        <TextInput label="Branch" name="branch" required defaultValue={initial.branch} errors={e?.branch} />
        <TextInput label="Routing number" name="routingNumber" required={false} defaultValue={initial.routingNumber} errors={e?.routingNumber} />
      </FormGrid>
      <SubmitButton pendingLabel="Saving...">Save payout account</SubmitButton>
    </form>
  );
}
