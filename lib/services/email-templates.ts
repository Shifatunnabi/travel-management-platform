import { publicEnv } from "@/lib/env";

const BRAND = "#0b1878";
const BRAND_LIGHT = "#f0f1fc";

function layout(heading: string, body: string, cta?: { label: string; href: string }): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,.08);">
        <tr><td style="background:${BRAND};padding:24px 32px;">
          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-.02em;">Tofiza</span>
          <span style="color:#c0c5f2;font-size:13px;margin-left:8px;">Tours &amp; Travels</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0f172a;font-weight:700;">${heading}</h1>
          <div style="font-size:15px;line-height:1.65;color:#475569;">${body}</div>
          ${
            cta
              ? `<div style="margin:28px 0 8px;"><a href="${cta.href}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 26px;border-radius:10px;">${cta.label}</a></div>
                 <p style="font-size:12px;color:#94a3b8;margin:16px 0 0;word-break:break-all;">If the button does not work, paste this into your browser:<br>${cta.href}</p>`
              : ""
          }
        </td></tr>
        <tr><td style="background:${BRAND_LIGHT};padding:20px 32px;font-size:12px;color:#64748b;">
          You are receiving this because you have an account with Tofiza Tours &amp; Travels.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function verifyEmailTemplate(name: string, token: string) {
  const href = `${publicEnv.appUrl}/auth/verify?token=${encodeURIComponent(token)}`;
  return {
    subject: "Confirm your email address",
    html: layout(
      `Welcome, ${escapeHtml(name)}`,
      `<p style="margin:0 0 12px;">Your Tofiza account is ready. Confirm your email address so we can send you booking vouchers and trip updates.</p>
       <p style="margin:0;">This link expires in 24 hours.</p>`,
      { label: "Confirm email address", href },
    ),
  };
}

export function resetPasswordTemplate(name: string, token: string) {
  const href = `${publicEnv.appUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
  return {
    subject: "Reset your Tofiza password",
    html: layout(
      `Password reset`,
      `<p style="margin:0 0 12px;">Hello ${escapeHtml(name)}, we received a request to reset your password.</p>
       <p style="margin:0;">This link expires in 1 hour. If you did not ask for this, you can ignore this email — your password stays unchanged.</p>`,
      { label: "Choose a new password", href },
    ),
  };
}

export interface BookingEmailData {
  ref: string;
  guestName: string;
  hotelName: string;
  hotelAddress: string;
  roomName: string;
  ratePlanName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: string;
  total: string;
}

export function bookingConfirmedTemplate(d: BookingEmailData) {
  const rows: [string, string][] = [
    ["Booking reference", d.ref],
    ["Property", d.hotelName],
    ["Address", d.hotelAddress],
    ["Room", `${d.roomName} — ${d.ratePlanName}`],
    ["Check-in", d.checkIn],
    ["Check-out", d.checkOut],
    ["Nights", String(d.nights)],
    ["Guests", d.guests],
    ["Total paid", d.total],
  ];
  return {
    subject: `Booking confirmed — ${d.ref}`,
    html: layout(
      "Your stay is confirmed",
      `<p style="margin:0 0 20px;">Thank you, ${escapeHtml(d.guestName)}. Your reservation is confirmed and the property has been notified.</p>
       ${table(rows)}
       <p style="margin:20px 0 0;">Present this reference at check-in. You can view or cancel this booking any time from your account.</p>`,
      { label: "View booking", href: `${publicEnv.appUrl}/account/bookings` },
    ),
  };
}

export function bookingCancelledTemplate(ref: string, name: string, refundAmount: string) {
  return {
    subject: `Booking cancelled — ${ref}`,
    html: layout(
      "Booking cancelled",
      `<p style="margin:0 0 12px;">Hello ${escapeHtml(name)}, booking <strong>${ref}</strong> has been cancelled.</p>
       <p style="margin:0;">A refund of <strong>${refundAmount}</strong> will be returned to your original payment method within 5–10 working days.</p>`,
    ),
  };
}

export function vendorNewBookingTemplate(d: BookingEmailData) {
  return {
    subject: `New booking — ${d.ref}`,
    html: layout(
      "You have a new booking",
      `${table([
        ["Reference", d.ref],
        ["Guest", d.guestName],
        ["Room", `${d.roomName} — ${d.ratePlanName}`],
        ["Check-in", d.checkIn],
        ["Check-out", d.checkOut],
        ["Guests", d.guests],
      ])}`,
      { label: "Open in dashboard", href: `${publicEnv.appUrl}/vendor/bookings` },
    ),
  };
}

export function vendorStatusTemplate(businessName: string, approved: boolean, note?: string) {
  return {
    subject: approved ? "Your Tofiza partner account is approved" : "About your Tofiza partner application",
    html: layout(
      approved ? "You are approved" : "Application needs attention",
      approved
        ? `<p style="margin:0 0 12px;"><strong>${escapeHtml(businessName)}</strong> has been approved. You can now publish properties and take bookings.</p>`
        : `<p style="margin:0 0 12px;">We could not approve <strong>${escapeHtml(businessName)}</strong> yet.</p>
           ${note ? `<p style="margin:0;padding:12px 14px;background:#fef2f2;border-radius:8px;color:#991b1b;">${escapeHtml(note)}</p>` : ""}`,
      { label: "Open partner dashboard", href: `${publicEnv.appUrl}/vendor` },
    ),
  };
}

export function payoutStatusTemplate(
  businessName: string,
  status: string,
  amount: string,
  detail?: string,
) {
  return {
    subject: `Disbursement ${status} — ${amount}`,
    html: layout(
      `Disbursement ${status}`,
      `<p style="margin:0 0 12px;">Hello ${escapeHtml(businessName)},</p>
       <p style="margin:0 0 12px;">Your disbursement request for <strong>${amount}</strong> is now <strong>${status}</strong>.</p>
       ${detail ? `<p style="margin:0;padding:12px 14px;background:#f8fafc;border-radius:8px;">${escapeHtml(detail)}</p>` : ""}`,
      { label: "View finances", href: `${publicEnv.appUrl}/vendor/finance` },
    ),
  };
}

export function reviewInviteTemplate(name: string, hotelName: string, bookingRef: string) {
  return {
    subject: `How was your stay at ${hotelName}?`,
    html: layout(
      "Tell us about your stay",
      `<p style="margin:0 0 12px;">Hello ${escapeHtml(name)}, we hope you enjoyed <strong>${escapeHtml(hotelName)}</strong>.</p>
       <p style="margin:0;">Your review helps other travellers choose well — it takes under a minute.</p>`,
      { label: "Write a review", href: `${publicEnv.appUrl}/account/bookings/${bookingRef}?review=1` },
    ),
  };
}

function table(rows: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:9px 0;color:#94a3b8;border-bottom:1px solid #f1f5f9;width:42%;">${escapeHtml(k)}</td>
               <td style="padding:9px 0;color:#0f172a;font-weight:600;border-bottom:1px solid #f1f5f9;">${escapeHtml(v)}</td></tr>`,
      )
      .join("")}
  </table>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
