import { z } from "zod";

/** Shape every server action returns, so forms can render errors uniformly. */
export type ActionState<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export const idleState: ActionState = { ok: true };

export function fail(message: string, fieldErrors?: Record<string, string[]>): ActionState<never> {
  return { ok: false, message, fieldErrors };
}

export function succeed<T = undefined>(message?: string, data?: T): ActionState<T> {
  return { ok: true, message, data };
}

/** Turns a Zod failure into the field-error map the forms expect. */
export function fromZod(error: z.ZodError): ActionState<never> {
  const flat = z.flattenError(error);
  const fieldErrors = flat.fieldErrors as Record<string, string[]>;
  const first = Object.values(fieldErrors).flat()[0] ?? flat.formErrors[0];
  return {
    ok: false,
    message: first ?? "Please check the highlighted fields.",
    fieldErrors,
  };
}

/** Parses FormData against a schema, returning either data or an ActionState. */
export function parseForm<S extends z.ZodType>(
  schema: S,
  formData: FormData,
): { ok: true; data: z.infer<S> } | { ok: false; state: ActionState<never> } {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION")) continue;
    if (raw[key] !== undefined) {
      raw[key] = Array.isArray(raw[key]) ? [...(raw[key] as unknown[]), value] : [raw[key], value];
    } else {
      raw[key] = value;
    }
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, state: fromZod(parsed.error) };
  return { ok: true, data: parsed.data };
}
