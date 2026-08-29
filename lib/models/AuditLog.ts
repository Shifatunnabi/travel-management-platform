import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IAuditLog {
  _id: Types.ObjectId;
  actorId?: Types.ObjectId | null;
  actorName: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  ip?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    actorName: { type: String, default: "system" },
    actorRole: { type: String, default: "system" },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: { type: String, index: true },
    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed,
    reason: String,
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog: Model<IAuditLog> =
  (models.AuditLog as Model<IAuditLog>) ?? model<IAuditLog>("AuditLog", auditLogSchema);
