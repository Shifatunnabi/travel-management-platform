"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import { requireVendor } from "@/lib/auth/guards";
import { User } from "@/lib/models/User";
import { VendorMember, Vendor } from "@/lib/models/Vendor";
import { VENDOR_MEMBER_ROLES } from "@/lib/models/types";
import { audit } from "@/lib/services/audit";
import { sendMail } from "@/lib/services/mailer";
import { publicEnv } from "@/lib/env";
import { fail, parseForm, succeed, type ActionState } from "./_result";

const inviteSchema = z.object({
  name: z.string().min(2, "Enter their name").max(120),
  email: z.email("Enter a valid email address"),
  role: z.enum(VENDOR_MEMBER_ROLES),
});

/**
 * Invites a colleague. Creates the account with a random password and emails a
 * reset link, so no one has to send a password around.
 */
export async function inviteTeamMemberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const owner = await requireVendor(["owner"]);
  const parsed = parseForm(inviteSchema, formData);
  if (!parsed.ok) return parsed.state;

  const { name, email, role } = parsed.data;
  await connectDB();

  const vendor = await Vendor.findById(owner.vendorId).select("businessName").lean();
  const lower = email.toLowerCase();
  let user = await User.findOne({ email: lower });

  if (user) {
    if (user.role === "platform") return fail("That address belongs to a platform account.");
    const existing = await VendorMember.findOne({ userId: user._id }).lean();
    if (existing) {
      return fail(
        String(existing.vendorId) === owner.vendorId
          ? "They are already on your team."
          : "That person already works with another partner.",
      );
    }
    user.role = "vendor";
    await user.save();
  } else {
    const resetToken = randomBytes(32).toString("hex");
    user = await User.create({
      name,
      email: lower,
      passwordHash: await bcrypt.hash(randomBytes(24).toString("hex"), 12),
      role: "vendor",
      resetToken,
      resetTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    void sendMail({
      to: lower,
      subject: `You have been added to ${vendor?.businessName ?? "a Tofiza partner"}`,
      template: "vendor-invite",
      html: `<p>Hello ${name},</p>
        <p>${owner.name ?? "Your colleague"} has added you to <strong>${vendor?.businessName ?? "their team"}</strong> on Tofiza as a ${role}.</p>
        <p><a href="${publicEnv.appUrl}/auth/reset-password?token=${resetToken}">Set your password</a> to get started. This link is valid for 7 days.</p>`,
      relatedTo: { entity: "Vendor", id: owner.vendorId },
    });
  }

  await VendorMember.create({
    vendorId: owner.vendorId,
    userId: user._id,
    role,
    invitedBy: owner.id,
  });

  await audit({
    actor: owner, action: "team.invite", entity: "VendorMember",
    entityId: String(user._id), after: { email: lower, role },
  });

  revalidatePath("/vendor/team");
  return succeed(`${name} has been invited as ${role}. They will get an email to set a password.`);
}

export async function removeTeamMemberAction(userId: string): Promise<ActionState> {
  const owner = await requireVendor(["owner"]);
  if (userId === owner.id) return fail("You cannot remove yourself.");

  await connectDB();
  const membership = await VendorMember.findOne({ vendorId: owner.vendorId, userId });
  if (!membership) return fail("They are not on your team.");
  if (membership.role === "owner") return fail("The account owner cannot be removed.");

  await membership.deleteOne();
  await audit({
    actor: owner, action: "team.remove", entity: "VendorMember", entityId: userId,
  });

  revalidatePath("/vendor/team");
  return succeed("Access removed. They can no longer sign in to this account.");
}
