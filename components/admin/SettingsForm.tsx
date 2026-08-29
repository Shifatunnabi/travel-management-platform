"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "@/lib/actions/admin";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "./SubmitBar";
import { FormGrid, TextInput } from "./Inputs";

export default function SettingsForm({
  initial,
}: {
  initial: {
    defaultCommissionPct: number;
    taxPct: number;
    serviceFee: number;
    settlementDays: number;
    holdMinutes: number;
    maxRatingOffset: number;
    minPayoutAmount: number;
    supportEmail: string;
    supportPhone: string;
  };
}) {
  const [state, action] = useActionState(saveSettingsAction, idleState);
  const e = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={action} className="space-y-6">
      <ActionMessage state={state} />

      <section>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Money</h3>
        <FormGrid cols={3}>
          <TextInput
            label="Default commission" name="defaultCommissionPct" type="number" step={0.5} min={0} max={100} required
            defaultValue={initial.defaultCommissionPct}
            hint="Percent of each booking Tofiza keeps."
            errors={e?.defaultCommissionPct}
          />
          <TextInput label="Tax rate" name="taxPct" type="number" step={0.5} min={0} required defaultValue={initial.taxPct} hint="Added to the room total." errors={e?.taxPct} />
          <TextInput label="Service fee" name="serviceFee" type="number" min={0} required prefix="৳" defaultValue={initial.serviceFee} hint="Flat, per booking." errors={e?.serviceFee} />
        </FormGrid>
      </section>

      <section>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Timing</h3>
        <FormGrid cols={3}>
          <TextInput
            label="Settlement window (days)" name="settlementDays" type="number" min={0} max={90} required
            defaultValue={initial.settlementDays}
            hint="Days after check-out before a vendor can withdraw."
            errors={e?.settlementDays}
          />
          <TextInput
            label="Checkout hold (minutes)" name="holdMinutes" type="number" min={1} max={240} required
            defaultValue={initial.holdMinutes}
            hint="How long a room is reserved during payment."
            errors={e?.holdMinutes}
          />
          <TextInput
            label="Minimum payout" name="minPayoutAmount" type="number" min={0} required prefix="৳"
            defaultValue={initial.minPayoutAmount}
            hint="Smallest disbursement a vendor may request."
            errors={e?.minPayoutAmount}
          />
        </FormGrid>
      </section>

      <section>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Guardrails</h3>
        <FormGrid>
          <TextInput
            label="Maximum rating offset" name="maxRatingOffset" type="number" step={0.1} min={0} max={5} required
            defaultValue={initial.maxRatingOffset}
            hint="Hard cap on how far a super admin can move a displayed rating."
            errors={e?.maxRatingOffset}
          />
        </FormGrid>
      </section>

      <section>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Support contact</h3>
        <FormGrid>
          <TextInput label="Support email" name="supportEmail" type="email" required defaultValue={initial.supportEmail} errors={e?.supportEmail} />
          <TextInput label="Support phone" name="supportPhone" required defaultValue={initial.supportPhone} errors={e?.supportPhone} />
        </FormGrid>
      </section>

      <SubmitButton pendingLabel="Saving...">Save settings</SubmitButton>
    </form>
  );
}
