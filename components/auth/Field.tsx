"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

export function Field({
  label,
  name,
  type = "text",
  icon: Icon,
  placeholder,
  errors,
  defaultValue,
  required = true,
  autoComplete,
  labelAction,
  onValueChange,
}: {
  label: string;
  name: string;
  type?: string;
  icon?: LucideIcon;
  placeholder?: string;
  errors?: string[];
  defaultValue?: string;
  required?: boolean;
  autoComplete?: string;
  labelAction?: React.ReactNode;
  /** Notified on every keystroke, for things like a password strength meter. */
  onValueChange?: (value: string) => void;
}) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const invalid = Boolean(errors?.length);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="text-xs font-semibold text-slate-600">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          id={id}
          name={name}
          type={isPassword && reveal ? "text" : type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          required={required}
          autoComplete={autoComplete}
          onChange={onValueChange ? (e) => onValueChange(e.target.value) : undefined}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          className={`w-full border rounded-xl py-3 text-sm outline-none transition-all ${
            Icon ? "pl-9" : "pl-3"
          } ${isPassword ? "pr-10" : "pr-3"} ${
            invalid
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {invalid && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {errors![0]}
        </p>
      )}
    </div>
  );
}

export function FormMessage({ state }: { state: { ok: boolean; message?: string } }) {
  if (!state.message) return null;
  return (
    <div
      role="status"
      className={`rounded-xl px-4 py-3 text-sm ${
        state.ok
          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      {state.message}
    </div>
  );
}
