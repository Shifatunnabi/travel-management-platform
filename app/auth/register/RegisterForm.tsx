"use client";

import { useActionState, useState } from "react";
import { User, Mail, Lock, Phone } from "lucide-react";
import { registerAction } from "@/lib/actions/auth";
import { idleState } from "@/lib/actions/_result";
import { Field, FormMessage } from "@/components/auth/Field";
import SubmitButton from "@/components/auth/SubmitButton";

const STRENGTH_COLORS = ["bg-slate-200", "bg-red-400", "bg-amber-400", "bg-emerald-500"];
const STRENGTH_LABELS = ["", "Weak", "Fair", "Strong"];

/** Mirrors passwordSchema in lib/validation/auth.ts — the server still decides. */
function scorePassword(value: string): number {
  if (!value) return 0;
  const checks = [/[a-z]/, /[A-Z]/, /[0-9]/].filter((re) => re.test(value)).length;
  if (value.length < 8 || checks < 3) return value.length < 6 ? 1 : 2;
  return 3;
}

export default function RegisterForm() {
  const [state, action] = useActionState(registerAction, idleState);
  const [password, setPassword] = useState("");
  const strength = scorePassword(password);
  const errors = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" name="firstName" icon={User} placeholder="First" errors={errors?.firstName} autoComplete="given-name" />
        <Field label="Last Name" name="lastName" placeholder="Last" errors={errors?.lastName} autoComplete="family-name" />
      </div>

      <Field label="Email Address" name="email" type="email" icon={Mail} placeholder="you@email.com" errors={errors?.email} autoComplete="email" />
      <Field label="Phone Number" name="phone" type="tel" icon={Phone} placeholder="+880 1XXX-XXXXXX" errors={errors?.phone} autoComplete="tel" />

      <div>
        <Field
          label="Password"
          name="password"
          type="password"
          icon={Lock}
          placeholder="At least 8 characters"
          errors={errors?.password}
          autoComplete="new-password"
          onValueChange={setPassword}
        />
        {password && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= strength ? STRENGTH_COLORS[strength] : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-medium text-slate-500">{STRENGTH_LABELS[strength]}</span>
          </div>
        )}
      </div>

      <Field
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        icon={Lock}
        placeholder="Re-enter your password"
        errors={errors?.confirmPassword}
        autoComplete="new-password"
      />

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="acceptTerms"
          value="true"
          required
          className="w-4 h-4 mt-0.5 rounded border-slate-300 text-brand-600 shrink-0"
        />
        <span className="text-xs text-slate-600 leading-relaxed">
          I agree to Tofiza&apos;s Terms of Service and Privacy Policy.
        </span>
      </label>
      {errors?.acceptTerms && <p className="text-xs text-red-600">{errors.acceptTerms[0]}</p>}

      <SubmitButton pendingLabel="Creating account...">Create Account</SubmitButton>
    </form>
  );
}

