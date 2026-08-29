import { headers } from "next/headers";
import { connectDB } from "@/lib/db/connect";
import { AuditLog } from "@/lib/models/AuditLog";
import type { SessionUser } from "@/lib/auth/guards";

export interface AuditInput {
  actor: SessionUser | null;
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
}

/**
 * Writes an audit row. Never throws — losing the log must not roll back the
 * change it describes, and a dropped row surfaces in the console.
 */
export async function audit(input: AuditInput): Promise<void> {
  try {
    await connectDB();
    let ip: string | undefined;
    try {
      const h = await headers();
      ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
    } catch {
      // called outside a request scope (e.g. a script) — no IP to record
    }
    await AuditLog.create({
      actorId: input.actor?.id ?? null,
      actorName: input.actor?.name ?? "system",
      actorRole: input.actor
        ? `${input.actor.role}${input.actor.platformRole ? `:${input.actor.platformRole}` : ""}`
        : "system",
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      before: input.before,
      after: input.after,
      reason: input.reason,
      ip,
    });
  } catch (error) {
    console.error("[audit] failed to record", input.action, error);
  }
}

/** Trims a Mongoose doc down to the fields worth diffing in the audit view. */
export function snapshot<T extends object>(doc: T, fields: (keyof T)[]): Partial<T> {
  const out: Partial<T> = {};
  for (const f of fields) out[f] = doc[f];
  return out;
}
