import { env, isPaymentConfigured, publicEnv } from "@/lib/env";

const SANDBOX = "https://sandbox.sslcommerz.com";
const LIVE = "https://securepay.sslcommerz.com";

function base(): string {
  return env.SSLCOMMERZ_IS_LIVE ? LIVE : SANDBOX;
}

export interface SessionInput {
  tranId: string;
  amount: number;
  currency: string;
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
}

export interface SessionResult {
  ok: boolean;
  gatewayUrl?: string;
  error?: string;
}

/**
 * Opens a payment session and returns the URL to send the guest to. The
 * callback URLs are absolute because SSLCommerz calls them from its own
 * servers, not from the browser.
 */
export async function createSession(input: SessionInput): Promise<SessionResult> {
  if (!isPaymentConfigured()) {
    return {
      ok: false,
      error: "Card payment is not configured yet. Contact support to complete this booking.",
    };
  }

  const appUrl = publicEnv.appUrl;
  const body = new URLSearchParams({
    store_id: env.SSLCOMMERZ_STORE_ID,
    store_passwd: env.SSLCOMMERZ_STORE_PASSWORD,
    total_amount: String(input.amount),
    currency: input.currency,
    tran_id: input.tranId,
    success_url: `${appUrl}/api/payments/sslcommerz/success`,
    fail_url: `${appUrl}/api/payments/sslcommerz/fail`,
    cancel_url: `${appUrl}/api/payments/sslcommerz/cancel`,
    ipn_url: `${appUrl}/api/payments/sslcommerz/ipn`,
    cus_name: input.customerName,
    cus_email: input.customerEmail,
    cus_phone: input.customerPhone,
    cus_add1: "N/A",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    shipping_method: "NO",
    product_name: input.productName,
    product_category: "Accommodation",
    product_profile: "travel-vertical",
    value_a: input.bookingRef,
  });

  try {
    const res = await fetch(`${base()}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    const data = (await res.json()) as {
      status?: string;
      GatewayPageURL?: string;
      failedreason?: string;
    };

    if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
      return { ok: false, error: data.failedreason || "The payment gateway refused this request." };
    }
    return { ok: true, gatewayUrl: data.GatewayPageURL };
  } catch (error) {
    console.error("[sslcommerz] session failed:", error);
    return { ok: false, error: "Could not reach the payment gateway. Try again." };
  }
}

export interface ValidationResult {
  valid: boolean;
  status?: string;
  amount?: number;
  currency?: string;
  tranId?: string;
  bankTranId?: string;
  cardType?: string;
  cardIssuer?: string;
  raw?: Record<string, unknown>;
  error?: string;
}

/**
 * Asks SSLCommerz directly whether a transaction really succeeded. The browser
 * redirect is only a navigation — anyone can type that URL — so nothing is
 * confirmed until this returns VALID or VALIDATED.
 */
export async function validatePayment(valId: string): Promise<ValidationResult> {
  if (!isPaymentConfigured()) return { valid: false, error: "Gateway not configured." };

  const url = new URL(`${base()}/validator/api/validationserverAPI.php`);
  url.searchParams.set("val_id", valId);
  url.searchParams.set("store_id", env.SSLCOMMERZ_STORE_ID);
  url.searchParams.set("store_passwd", env.SSLCOMMERZ_STORE_PASSWORD);
  url.searchParams.set("format", "json");

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as Record<string, unknown>;
    const status = String(data.status ?? "");

    return {
      valid: status === "VALID" || status === "VALIDATED",
      status,
      amount: Number(data.amount ?? data.store_amount ?? 0),
      currency: String(data.currency ?? ""),
      tranId: String(data.tran_id ?? ""),
      bankTranId: String(data.bank_tran_id ?? ""),
      cardType: String(data.card_type ?? ""),
      cardIssuer: String(data.card_issuer ?? ""),
      raw: data,
    };
  } catch (error) {
    console.error("[sslcommerz] validation failed:", error);
    return { valid: false, error: "Could not reach the validation API." };
  }
}

export interface RefundResult {
  ok: boolean;
  refundRefId?: string;
  error?: string;
}

export async function refundPayment(
  bankTranId: string,
  amount: number,
  reason: string,
): Promise<RefundResult> {
  if (!isPaymentConfigured()) return { ok: false, error: "Gateway not configured." };

  const url = new URL(`${base()}/validator/api/merchantTransIDvalidationAPI.php`);
  url.searchParams.set("bank_tran_id", bankTranId);
  url.searchParams.set("store_id", env.SSLCOMMERZ_STORE_ID);
  url.searchParams.set("store_passwd", env.SSLCOMMERZ_STORE_PASSWORD);
  url.searchParams.set("refund_amount", String(amount));
  url.searchParams.set("refund_remarks", reason.slice(0, 255));
  url.searchParams.set("format", "json");

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as { APIConnect?: string; status?: string; refund_ref_id?: string; errorReason?: string };
    if (data.status === "success" || data.status === "processing") {
      return { ok: true, refundRefId: data.refund_ref_id };
    }
    return { ok: false, error: data.errorReason || "The gateway declined the refund." };
  } catch (error) {
    console.error("[sslcommerz] refund failed:", error);
    return { ok: false, error: "Could not reach the refund API." };
  }
}

/** Transaction id that is unique, readable in the gateway dashboard, and traceable. */
export function makeTranId(bookingRef: string): string {
  return `${bookingRef}-${Date.now().toString(36).toUpperCase()}`;
}
