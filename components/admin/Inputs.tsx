"use client";

import { useId, useState, type ReactNode } from "react";
import { X } from "lucide-react";

const base =
  "w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-all bg-white";
const ok = "border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const bad = "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100";

function Wrap({
  label,
  hint,
  errors,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  errors?: string[];
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
      </label>
      {children}
      {errors?.length ? (
        <p className="mt-1 text-xs text-rose-600">{errors[0]}</p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  label, name, hint, errors, defaultValue, placeholder, type = "text",
  required, min, max, step, prefix,
}: {
  label: string; name: string; hint?: string; errors?: string[];
  defaultValue?: string | number; placeholder?: string; type?: string;
  required?: boolean; min?: number; max?: number; step?: number; prefix?: string;
}) {
  const id = useId();
  return (
    <Wrap label={label} hint={hint} errors={errors} htmlFor={id}>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={id} name={name} type={type} defaultValue={defaultValue}
          placeholder={placeholder} required={required} min={min} max={max} step={step}
          aria-invalid={Boolean(errors?.length)}
          className={`${base} ${errors?.length ? bad : ok} ${prefix ? "pl-7" : ""}`}
        />
      </div>
    </Wrap>
  );
}

export function TextArea({
  label, name, hint, errors, defaultValue, placeholder, rows = 5, required,
}: {
  label: string; name: string; hint?: string; errors?: string[];
  defaultValue?: string; placeholder?: string; rows?: number; required?: boolean;
}) {
  const id = useId();
  return (
    <Wrap label={label} hint={hint} errors={errors} htmlFor={id}>
      <textarea
        id={id} name={name} rows={rows} defaultValue={defaultValue}
        placeholder={placeholder} required={required}
        aria-invalid={Boolean(errors?.length)}
        className={`${base} ${errors?.length ? bad : ok} resize-y`}
      />
    </Wrap>
  );
}

export function Select({
  label, name, hint, errors, defaultValue, options, required,
}: {
  label: string; name: string; hint?: string; errors?: string[];
  defaultValue?: string | number; required?: boolean;
  options: { value: string | number; label: string }[];
}) {
  const id = useId();
  return (
    <Wrap label={label} hint={hint} errors={errors} htmlFor={id}>
      <select
        id={id} name={name} defaultValue={defaultValue} required={required}
        className={`${base} ${errors?.length ? bad : ok}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Wrap>
  );
}

export function Toggle({
  label, name, hint, defaultChecked,
}: {
  label: string; name: string; hint?: string; defaultChecked?: boolean;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer py-1">
      <input
        id={id} name={name} type="checkbox" value="true" defaultChecked={defaultChecked}
        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-brand-600 shrink-0"
      />
      <span>
        <span className="block text-sm font-medium text-slate-700">{label}</span>
        {hint && <span className="block text-[11px] text-slate-400">{hint}</span>}
      </span>
    </label>
  );
}

/**
 * Free-text chips serialized to a comma-separated hidden field, which is what
 * the Zod schema expects. Suggestions cover the common cases without limiting
 * a vendor to a fixed list.
 */
export function ChipsInput({
  label, name, hint, errors, initial = [], suggestions = [], placeholder = "Type and press Enter",
}: {
  label: string; name: string; hint?: string; errors?: string[];
  initial?: string[]; suggestions?: string[]; placeholder?: string;
}) {
  const id = useId();
  const [chips, setChips] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const value = raw.trim().replace(/,/g, "");
    if (!value || chips.some((c) => c.toLowerCase() === value.toLowerCase())) return;
    setChips((prev) => [...prev, value]);
    setDraft("");
  };

  const unused = suggestions.filter(
    (s) => !chips.some((c) => c.toLowerCase() === s.toLowerCase()),
  );

  return (
    <Wrap label={label} hint={hint} errors={errors} htmlFor={id}>
      <input type="hidden" name={name} value={chips.join(",")} readOnly />
      <div className={`${base} ${errors?.length ? bad : ok} flex flex-wrap gap-1.5 min-h-[46px] items-center`}>
        {chips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-medium px-2 py-1 rounded-lg"
          >
            {chip}
            <button
              type="button"
              onClick={() => setChips((prev) => prev.filter((c) => c !== chip))}
              aria-label={`Remove ${chip}`}
              className="text-brand-400 hover:text-brand-700"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft) {
              setChips((prev) => prev.slice(0, -1));
            }
          }}
          onBlur={() => add(draft)}
          placeholder={chips.length ? "" : placeholder}
          className="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
        />
      </div>
      {unused.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {unused.slice(0, 12).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 text-slate-500 hover:border-brand-300 hover:text-brand-600 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </Wrap>
  );
}

export function FormGrid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  const map = { 1: "grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" } as const;
  return <div className={`grid grid-cols-1 gap-4 ${map[cols]}`}>{children}</div>;
}
