"use client";

import { useActionState, useTransition } from "react";
import { Ticket, Pause, Play, Loader2 } from "lucide-react";
import { setCouponStatusAction } from "@/lib/actions/coupon";
import { idleState, type ActionState } from "@/lib/actions/_result";
import { Card, EmptyState, StatusPill, TableWrap, Th, Td } from "./Shell";
import { SubmitButton, ActionMessage } from "./SubmitBar";
import { FormGrid, Select, TextInput } from "./Inputs";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";

export interface CouponRow {
  id: string;
  code: string;
  description?: string;
  type: "percent" | "fixed";
  value: number;
  minSpend: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  validFrom: string;
  validTo: string;
  status: string;
  scope: string;
}

export default function CouponManager({
  coupons,
  action,
  costNote,
  today,
  inAMonth,
}: {
  coupons: CouponRow[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  costNote: string;
  /** Supplied by the server so the form is deterministic to render. */
  today: string;
  inAMonth: string;
}) {
  const [state, formAction] = useActionState(action, idleState);
  const [pending, start] = useTransition();
  const e = state.ok ? undefined : state.fieldErrors;


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card title="Codes">
          {coupons.length === 0 ? (
            <EmptyState icon={Ticket} title="No codes yet" description="Create one with the form beside this." />
          ) : (
            <TableWrap>
              <thead>
                <tr className="border-b border-slate-100">
                  <Th>Code</Th>
                  <Th>Discount</Th>
                  <Th>Conditions</Th>
                  <Th align="right">Used</Th>
                  <Th>Status</Th>
                  <Th align="right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {coupons.map((c) => {
                  const expired = new Date(c.validTo) < new Date();
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <Td>
                        <span className="font-mono font-bold text-slate-900">{c.code}</span>
                        {c.description && (
                          <span className="block text-[11px] text-slate-500">{c.description}</span>
                        )}
                      </Td>
                      <Td className="text-slate-700">
                        {c.type === "percent" ? `${c.value}%` : formatCurrency(c.value)}
                        {c.maxDiscount != null && (
                          <span className="block text-[11px] text-slate-400">
                            max {formatCurrency(c.maxDiscount)}
                          </span>
                        )}
                      </Td>
                      <Td className="text-xs text-slate-500">
                        {c.minSpend > 0 && <span className="block">min {formatCurrency(c.minSpend)}</span>}
                        <span className="block">
                          {formatDate(c.validFrom)} – {formatDate(c.validTo)}
                        </span>
                      </Td>
                      <Td align="right" className="tabular-nums text-slate-700">
                        {c.usedCount}
                        {c.usageLimit != null && <span className="text-slate-400"> / {c.usageLimit}</span>}
                      </Td>
                      <Td><StatusPill status={expired ? "expired" : c.status} /></Td>
                      <Td align="right">
                        {!expired && (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              start(async () => {
                                await setCouponStatusAction(c.id, c.status === "active" ? "paused" : "active");
                              })
                            }
                            title={c.status === "active" ? "Pause this code" : "Reactivate"}
                            className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50"
                          >
                            {pending ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : c.status === "active" ? (
                              <Pause size={14} />
                            ) : (
                              <Play size={14} />
                            )}
                          </button>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
          )}
        </Card>
      </div>

      <Card title="Create a code" description={costNote}>
        <form action={formAction} className="space-y-4">
          <ActionMessage state={state} />
          <TextInput label="Code" name="code" required placeholder="MONSOON20" hint="Uppercase letters and numbers." errors={e?.code} />
          <TextInput label="Description" name="description" required={false} placeholder="Monsoon campaign" errors={e?.description} />
          <FormGrid>
            <Select
              label="Type"
              name="type"
              defaultValue="percent"
              options={[
                { value: "percent", label: "Percentage off" },
                { value: "fixed", label: "Fixed amount off" },
              ]}
            />
            <TextInput label="Value" name="value" type="number" min={1} required defaultValue={10} errors={e?.value} />
          </FormGrid>
          <FormGrid>
            <TextInput label="Minimum spend" name="minSpend" type="number" min={0} required defaultValue={0} prefix="৳" errors={e?.minSpend} />
            <TextInput label="Cap discount at" name="maxDiscount" type="number" min={0} required={false} prefix="৳" hint="Percentage codes only." errors={e?.maxDiscount} />
          </FormGrid>
          <FormGrid>
            <TextInput label="Total uses" name="usageLimit" type="number" min={1} required={false} placeholder="Unlimited" errors={e?.usageLimit} />
            <TextInput label="Per customer" name="perUserLimit" type="number" min={1} required defaultValue={1} errors={e?.perUserLimit} />
          </FormGrid>
          <FormGrid>
            <TextInput label="Valid from" name="validFrom" type="date" required defaultValue={today} errors={e?.validFrom} />
            <TextInput label="Valid to" name="validTo" type="date" required defaultValue={inAMonth} errors={e?.validTo} />
          </FormGrid>
          <SubmitButton pendingLabel="Creating...">Create code</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
