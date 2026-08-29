import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";
import { connectDB } from "@/lib/db/connect";
import { EmailLog } from "@/lib/models/EmailLog";

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });
  return transporter;
}

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  template: string;
  relatedTo?: { entity: string; id: string };
}

/**
 * Sends and logs. Never throws — a failed booking-confirmation email must not
 * roll back a paid booking. Failures land in the admin email log instead.
 */
export async function sendMail(input: SendMailInput): Promise<boolean> {
  const from = `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_EMAIL}>`;
  try {
    const info = await getTransporter().sendMail({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text ?? stripHtml(input.html),
    });
    await logEmail(input, "sent", info.messageId);
    return true;
  } catch (error) {
    await logEmail(input, "failed", undefined, (error as Error).message);
    console.error(`[mailer] ${input.template} → ${input.to} failed:`, error);
    return false;
  }
}

async function logEmail(
  input: SendMailInput,
  status: "sent" | "failed",
  messageId?: string,
  error?: string,
) {
  try {
    await connectDB();
    await EmailLog.create({
      to: input.to,
      subject: input.subject,
      template: input.template,
      status,
      messageId,
      error,
      relatedTo: input.relatedTo ?? null,
    });
  } catch (logError) {
    console.error("[mailer] could not write email log:", logError);
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
