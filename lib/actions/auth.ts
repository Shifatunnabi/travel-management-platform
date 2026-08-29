"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/models/User";
import { Vendor, VendorMember } from "@/lib/models/Vendor";
import { sendMail } from "@/lib/services/mailer";
import { resetPasswordTemplate, verifyEmailTemplate } from "@/lib/services/email-templates";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";
import { fail, parseForm, succeed, type ActionState } from "./_result";

const BCRYPT_ROUNDS = 12;

function token(): string {
  return randomBytes(32).toString("hex");
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseForm(registerSchema, formData);
  if (!parsed.ok) return parsed.state;

  const { firstName, lastName, email, phone, password } = parsed.data;
  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() }).select("_id").lean();
  if (existing) {
    return fail("An account with that email already exists.", {
      email: ["An account with that email already exists."],
    });
  }

  const verificationToken = token();
  const name = `${firstName} ${lastName}`.trim();

  await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    phone,
    role: "customer",
    verificationToken,
    verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  // Verification is not a gate — the account works immediately, and the banner
  // in the account area nudges until it is confirmed.
  const mail = verifyEmailTemplate(name, verificationToken);
  void sendMail({
    to: email,
    subject: mail.subject,
    html: mail.html,
    template: "verify-email",
  });

  await signIn("credentials", { email, password, redirect: false });
  redirect("/account");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseForm(loginSchema, formData);
  if (!parsed.ok) return parsed.state;

  const callbackUrl = String(formData.get("callbackUrl") ?? "") || undefined;

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return fail("That email and password do not match an account.");
    }
    throw error;
  }

  // The session cookie `signIn` just set is not readable back through `auth()`
  // within this same request, so the landing page is resolved from the database
  // rather than from a session that does not exist yet.
  redirect(callbackUrl ?? (await landingPathForEmail(parsed.data.email)));
}

/** Where this account belongs after signing in. */
async function landingPathForEmail(email: string): Promise<string> {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() })
    .select("role")
    .lean();
  if (!user) return "/";
  if (user.role === "platform") return "/admin";
  if (user.role === "vendor") {
    const membership = await VendorMember.findOne({ userId: user._id })
      .select("vendorId")
      .lean();
    if (!membership) return "/vendor/onboarding";
    const vendor = await Vendor.findById(membership.vendorId).select("status").lean();
    return vendor?.status === "approved" ? "/vendor" : "/vendor/onboarding";
  }
  return "/account";
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseForm(forgotPasswordSchema, formData);
  if (!parsed.ok) return parsed.state;

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });

  // Always the same answer, so this cannot be used to discover which addresses
  // have accounts.
  const generic = succeed(
    "If an account exists for that address, a reset link is on its way.",
  );
  if (!user) return generic;

  const resetToken = token();
  user.resetToken = resetToken;
  user.resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const mail = resetPasswordTemplate(user.name, resetToken);
  await sendMail({
    to: user.email,
    subject: mail.subject,
    html: mail.html,
    template: "reset-password",
    relatedTo: { entity: "User", id: String(user._id) },
  });

  return generic;
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseForm(resetPasswordSchema, formData);
  if (!parsed.ok) return parsed.state;

  await connectDB();
  const user = await User.findOne({
    resetToken: parsed.data.token,
    resetTokenExpiresAt: { $gt: new Date() },
  }).select("+resetToken +resetTokenExpiresAt");

  if (!user) {
    return fail("That reset link has expired. Request a new one.");
  }

  user.passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS);
  user.resetToken = null;
  user.resetTokenExpiresAt = null;
  await user.save();

  return succeed("Password updated. You can sign in now.");
}

export async function verifyEmailAction(rawToken: string): Promise<boolean> {
  if (!rawToken) return false;
  await connectDB();

  const user = await User.findOne({
    verificationToken: rawToken,
    verificationTokenExpiresAt: { $gt: new Date() },
  }).select("+verificationToken +verificationTokenExpiresAt");

  if (!user) return false;

  user.emailVerifiedAt = new Date();
  user.verificationToken = null;
  user.verificationTokenExpiresAt = null;
  await user.save();
  return true;
}

export async function resendVerificationAction(): Promise<ActionState> {
  const { getSessionUser } = await import("@/lib/auth/guards");
  const sessionUser = await getSessionUser();
  if (!sessionUser) return fail("Sign in first.");

  await connectDB();
  const user = await User.findById(sessionUser.id);
  if (!user) return fail("Account not found.");
  if (user.emailVerifiedAt) return succeed("Your email is already verified.");

  const verificationToken = token();
  user.verificationToken = verificationToken;
  user.verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const mail = verifyEmailTemplate(user.name, verificationToken);
  await sendMail({
    to: user.email,
    subject: mail.subject,
    html: mail.html,
    template: "verify-email",
    relatedTo: { entity: "User", id: String(user._id) },
  });

  return succeed("Verification email sent. Check your inbox.");
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { requireUser } = await import("@/lib/auth/guards");
  const { profileSchema } = await import("@/lib/validation/auth");
  const sessionUser = await requireUser();

  const parsed = parseForm(profileSchema, formData);
  if (!parsed.ok) return parsed.state;

  await connectDB();
  await User.updateOne(
    { _id: sessionUser.id },
    {
      $set: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        nationality: parsed.data.nationality || undefined,
        dateOfBirth: parsed.data.dateOfBirth || undefined,
      },
    },
  );

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/account/profile");
  return succeed("Profile updated.");
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { requireUser } = await import("@/lib/auth/guards");
  const { changePasswordSchema } = await import("@/lib/validation/auth");
  const sessionUser = await requireUser();

  const parsed = parseForm(changePasswordSchema, formData);
  if (!parsed.ok) return parsed.state;

  await connectDB();
  const user = await User.findById(sessionUser.id).select("+passwordHash");
  if (!user) return fail("Account not found.");

  const matches = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!matches) {
    return fail("That is not your current password.", {
      currentPassword: ["Incorrect password."],
    });
  }

  user.passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS);
  await user.save();

  return succeed("Password changed.");
}
