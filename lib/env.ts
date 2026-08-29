import { z } from "zod";

/**
 * Server-side environment. Parsed once at module load so a missing or malformed
 * value fails `next build` instead of surfacing as a runtime 500 weeks later.
 * Never import this from a client component — see `publicEnv` below for that.
 */
const serverSchema = z.object({
  // Application
  NEXT_PUBLIC_APP_URL: z.url(),

  // MongoDB
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_DB_NAME: z.string().min(1),

  // Auth.js
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  AUTH_URL: z.url().optional(),
  AUTH_TRUST_HOST: z.stringbool().default(true),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_FOLDER: z.string().default("tofiza"),

  // Nodemailer
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_SECURE: z.stringbool().default(false),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  MAIL_FROM_NAME: z.string().min(1),
  MAIL_FROM_EMAIL: z.email(),

  // SSLCommerz — optional until the payment phase is switched on.
  SSLCOMMERZ_STORE_ID: z.string().default(""),
  SSLCOMMERZ_STORE_PASSWORD: z.string().default(""),
  SSLCOMMERZ_IS_LIVE: z.stringbool().default(false),

  // Seeding
  SEED_PLATFORM_ADMIN_EMAIL: z.email().optional(),
  SEED_PLATFORM_ADMIN_PASSWORD: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

function parseServerEnv(): ServerEnv {
  const result = serverSchema.safeParse(process.env);

  if (!result.success) {
    const lines = result.error.issues.map(
      (issue) => `  ${issue.path.join(".") || "(root)"} — ${issue.message}`,
    );
    throw new Error(
      `Invalid environment configuration:\n${lines.join("\n")}\n\n` +
        `Copy .env.example to .env.local and fill in the missing values.`,
    );
  }

  return result.data;
}

let cached: ServerEnv | undefined;

/**
 * Lazily parsed so that importing a module that touches `env` from a client
 * bundle does not blow up at build time — only actual server use triggers it.
 */
export const env: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, prop: string) {
    cached ??= parseServerEnv();
    return cached[prop as keyof ServerEnv];
  },
});

/** Safe to read from anywhere, including the browser. */
export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
} as const;

/** True once SSLCommerz credentials are present. */
export function isPaymentConfigured(): boolean {
  return Boolean(env.SSLCOMMERZ_STORE_ID && env.SSLCOMMERZ_STORE_PASSWORD);
}
