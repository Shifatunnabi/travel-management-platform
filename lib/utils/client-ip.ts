import { headers } from "next/headers";

/** The caller's address as the proxy in front of the app reports it. */
export async function clientIp(): Promise<string | undefined> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || undefined;
}
