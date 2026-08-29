import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IEmailLog {
  _id: Types.ObjectId;
  to: string;
  subject: string;
  template: string;
  status: "sent" | "failed";
  messageId?: string;
  error?: string;
  relatedTo?: { entity: string; id: string } | null;
  createdAt: Date;
}

const emailLogSchema = new Schema<IEmailLog>(
  {
    to: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    template: { type: String, required: true, index: true },
    status: { type: String, enum: ["sent", "failed"], required: true, index: true },
    messageId: String,
    error: String,
    relatedTo: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

emailLogSchema.index({ createdAt: -1 });

export const EmailLog: Model<IEmailLog> =
  (models.EmailLog as Model<IEmailLog>) ?? model<IEmailLog>("EmailLog", emailLogSchema);
