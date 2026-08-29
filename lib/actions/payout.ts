"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDB, withTransaction } from "@/lib/db/connect";
import { requirePlatform, requireVendor } from "@/lib/auth/guards";
import { Payout } from "@/lib/models/Payout";
import { Vendor } from "@/lib/models/Vendor";
import { LedgerEntry } from "@/lib/models/Ledger";
import { getVendorBalance } from "@/lib/services/ledger";
import { readSettings } from "@/lib/services/settings";
import { audit } from "@/lib/services/audit";
import { sendMail } from "@/lib/services/mailer";
import { payoutStatusTemplate } from "@/lib/services/email-templates";
import { payoutDecisionSchema } from "@/lib/validation/admin";
import { formatCurrency } from "@/lib/utils/formatters";
import { fail, parseForm, succeed, type ActionState } from "./_result";

const requestSchema = z.object({
  amount: z.coerce.number().int().min(1, "Enter an amount"),
});

/** A vendor asks for money. The amount is checked against the ledger, not the form. */
export async function requestPayoutAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireVendor(["owner"]);
  const parsed = parseForm(requestSchema, formData);
  if (!parsed.ok) return parsed.state;

  await connectDB();
  const [vendor, balance, settings] = await Promise.all([
    Vendor.findById(user.vendorId),
    getVendorBalance(user.vendorId),
    readSettings(),
  ]);
  if (!vendor) return fail("Vendor not found.");

  if (!vendor.bank.accountNumber) {
    return fail("Add your payout account in Settings first.");
  }
  if (!vendor.bank.verified) {
    return fail("Your bank details are waiting on platform verification.");
  }
  if (parsed.data.amount < settings.minPayoutAmount) {
    return fail(
      `The smallest disbursement is ${formatCurrency(settings.minPayoutAmount)}.`,
      { amount: [`Minimum ${formatCurrency(settings.minPayoutAmount)}.`] },
    );
  }
  if (parsed.data.amount > balance.withdrawable) {
    return fail(
      `You can withdraw up to ${formatCurrency(balance.withdrawable)} right now.`,
      { amount: [`Maximum ${formatCurrency(balance.withdrawable)}.`] },
    );
  }

  const payout = await Payout.create({
    vendorId: vendor._id,
    requestedAmount: parsed.data.amount,
    currency: "BDT",
    status: "requested",
    bankSnapshot: {
      accountName: vendor.bank.accountName,
      accountNumber: vendor.bank.accountNumber,
      bankName: vendor.bank.bankName,
      branch: vendor.bank.branch,
      routingNumber: vendor.bank.routingNumber,
    },
    requestedBy: user.id,
    timeline: [{ status: "requested", at: new Date(), by: user.id as never }],
  });

  await audit({
    actor: user, action: "payout.request", entity: "Payout",
    entityId: String(payout._id), after: { amount: parsed.data.amount },
  });

  revalidatePath("/vendor/finance");
  return succeed(
    `Requested ${formatCurrency(parsed.data.amount)}. The finance team usually responds within two working days.`,
  );
}

/** Platform finance approves, rejects, or marks a disbursement paid. */
export async function decidePayoutAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePlatform(["super_admin", "finance"]);
  const parsed = parseForm(payoutDecisionSchema, formData);
  if (!parsed.ok) return parsed.state;

  const { payoutId, decision, approvedAmount, reference, reason } = parsed.data;
  await connectDB();

  const payout = await Payout.findById(payoutId);
  if (!payout) return fail("That request does not exist.");

  const vendor = await Vendor.findById(payout.vendorId);
  if (!vendor) return fail("Vendor not found.");

  const before = { status: payout.status, approvedAmount: payout.approvedAmount };

  if (decision === "reject") {
    if (!reason?.trim()) {
      return fail("Give a reason — the partner sees it.", { reason: ["A reason is required."] });
    }
    payout.status = "rejected";
    payout.rejectionReason = reason;
    payout.reviewedBy = admin.id as never;
    payout.reviewedAt = new Date();
    payout.timeline.push({ status: "rejected", at: new Date(), by: admin.id as never, note: reason });
    await payout.save();
  } else if (decision === "approve") {
    if (payout.status !== "requested" && payout.status !== "under_review") {
      return fail("This request has already been decided.");
    }
    // Re-verify against the ledger at approval time, not just at request time.
    const balance = await getVendorBalance(String(payout.vendorId));
    const amount = approvedAmount ?? payout.requestedAmount;
    const headroom = balance.available - (balance.requested - payout.requestedAmount);

    if (amount > headroom) {
      return fail(
        `The ledger only supports ${formatCurrency(Math.max(0, headroom))} right now.`,
        { approvedAmount: [`Maximum ${formatCurrency(Math.max(0, headroom))}.`] },
      );
    }
    if (!vendor.bank.verified) {
      return fail("Verify the vendor's bank account before approving.");
    }

    payout.status = "approved";
    payout.approvedAmount = amount;
    payout.reviewedBy = admin.id as never;
    payout.reviewedAt = new Date();
    payout.timeline.push({ status: "approved", at: new Date(), by: admin.id as never });
    await payout.save();
  } else {
    if (payout.status !== "approved") {
      return fail("Approve the request before marking it paid.");
    }
    if (!reference?.trim()) {
      return fail("Record the bank reference.", { reference: ["A reference is required."] });
    }

    const amount = payout.approvedAmount ?? payout.requestedAmount;

    // The payout row and the ledger entry land together, or not at all.
    await withTransaction(async (session) => {
      await LedgerEntry.create(
        [
          {
            vendorId: payout.vendorId,
            payoutId: payout._id,
            type: "payout",
            amount: -amount,
            currency: payout.currency,
            note: `Disbursement ${reference}`,
            createdBy: admin.id,
          },
        ],
        { session, ordered: true },
      );

      payout.status = "paid";
      payout.paymentReference = reference;
      payout.paidAt = new Date();
      payout.timeline.push({ status: "paid", at: new Date(), by: admin.id as never, note: reference });
      await payout.save({ session });
    });
  }

  await audit({
    actor: admin, action: `payout.${decision}`, entity: "Payout",
    entityId: payoutId, before,
    after: { status: payout.status, approvedAmount: payout.approvedAmount, reference: payout.paymentReference },
    reason,
  });

  const finalStatus: string = payout.status;
  const mail = payoutStatusTemplate(
    vendor.businessName,
    finalStatus,
    formatCurrency(payout.approvedAmount ?? payout.requestedAmount),
    finalStatus === "paid"
      ? `Bank reference ${payout.paymentReference}`
      : (payout.rejectionReason ?? undefined),
  );
  void sendMail({
    to: vendor.contactEmail,
    subject: mail.subject,
    html: mail.html,
    template: "payout-status",
    relatedTo: { entity: "Payout", id: payoutId },
  });

  revalidatePath("/admin/payouts");
  return succeed(
    {
      approve: "Approved. Transfer the money, then mark it paid.",
      reject: "Rejected and the partner notified.",
      mark_paid: "Marked as paid and recorded in the ledger.",
    }[decision],
  );
}
