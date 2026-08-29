"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white",
    secondary: "bg-white border border-slate-200 hover:border-slate-300 text-slate-700",
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
  } as const;
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-5 py-2.5 text-sm" } as const;

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {pending && <Loader2 size={14} className="animate-spin" />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

export function ActionMessage({ state }: { state: { ok: boolean; message?: string } }) {
  if (!state.message) return null;
  return (
    <div
      role="status"
      className={`rounded-xl px-4 py-3 text-sm ${
        state.ok
          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
          : "bg-rose-50 text-rose-700 border border-rose-200"
      }`}
    >
      {state.message}
    </div>
  );
}
