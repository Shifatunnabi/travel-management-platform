"use client";

import { useActionState, useState } from "react";
import { User, Mail, Lock, Phone } from "lucide-react";
import { registerVendorAction } from "@/lib/actions/auth";
import { idleState } from "@/lib/actions/_result";
import { Field, FormMessage } from "@/components/auth/Field";
import SubmitButton from "@/components/auth/SubmitButton";

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

/**
 * Creates the partner's login. The business itself — name, address, KYC — is
 * the next step, at /vendor/onboarding.
 *
 * Controlled throughout for the same reason as the traveller form: React resets
 * a form once its action settles, which would empty it on any server rejection.
 */
export default function PartnerRegisterForm() {
  const [state, action] = useActionState(registerVendorAction, idleState);
  const [values, setValues] = useState(EMPTY);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const errors = state.ok ? undefined : state.fieldErrors;

  const set = (key: keyof typeof EMPTY) => (value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      action={async (formData) => {
        await action(formData);
        setAttempt((n) => n + 1);
      }}
      className="space-y-4"
    >
      <FormMessage state={state} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" name="firstName" icon={User} placeholder="First" errors={errors?.firstName} autoComplete="given-name" value={values.firstName} onValueChange={set("firstName")} />
        <Field label="Last Name" name="lastName" placeholder="Last" errors={errors?.lastName} autoComplete="family-name" value={values.lastName} onValueChange={set("lastName")} />
      </div>

      <Field label="Work Email" name="email" type="email" icon={Mail} placeholder="you@yourhotel.com" errors={errors?.email} autoComplete="email" value={values.email} onValueChange={set("email")} />
      <Field label="Phone Number" name="phone" type="tel" icon={Phone} placeholder="+880 1XXX-XXXXXX" errors={errors?.phone} autoComplete="tel" value={values.phone} onValueChange={set("phone")} />
      <Field label="Password" name="password" type="password" icon={Lock} placeholder="At least 8 characters" errors={errors?.password} autoComplete="new-password" value={values.password} onValueChange={set("password")} />
      <Field label="Confirm Password" name="confirmPassword" type="password" icon={Lock} placeholder="Re-enter your password" errors={errors?.confirmPassword} autoComplete="new-password" value={values.confirmPassword} onValueChange={set("confirmPassword")} />

      <input type="hidden" name="acceptTerms" value={acceptTerms ? "true" : ""} readOnly />
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          key={attempt}
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="w-4 h-4 mt-0.5 rounded border-slate-300 text-brand-600 shrink-0"
        />
        <span className="text-xs text-slate-600 leading-relaxed">
          I agree to Tofiza&apos;s Partner Terms and Privacy Policy, and confirm I am authorised to
          list this business.
        </span>
      </label>
      {errors?.acceptTerms && <p className="text-xs text-red-600">{errors.acceptTerms[0]}</p>}

      <SubmitButton pendingLabel="Creating account...">Continue</SubmitButton>
    </form>
  );
}
