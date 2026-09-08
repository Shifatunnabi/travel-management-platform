import { NextResponse } from "next/server";
import { z } from "zod";
import { signUpload, type UploadFolder } from "@/lib/services/cloudinary";
import { getSessionUser } from "@/lib/auth/guards";

const bodySchema = z.object({
  folder: z.enum(["hotels", "rooms", "kyc", "avatars"]),
  scopeId: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/, "Invalid scope"),
});

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const { folder, scopeId } = parsed.data;

  // Only vendors and platform staff may upload property media; a customer can
  // only ever sign an upload into their own avatar folder.
  const isStaff = user.role === "vendor" || user.role === "platform";
  if (folder !== "avatars" && !isStaff) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  if (folder === "avatars" && scopeId !== user.id) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  // A vendor may only sign uploads scoped to something they own. A first-time
  // applicant has no Vendor document yet — they have to upload KYC in order to
  // file the application that creates it — so their own user id is a valid
  // scope alongside `vendorId`, and is what `/vendor/onboarding` sends until
  // the business exists.
  if (user.role === "vendor" && folder === "kyc") {
    const ownScopes = [user.id, user.vendorId].filter(Boolean);
    if (!ownScopes.includes(scopeId)) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }
  }

  return NextResponse.json(signUpload(folder as UploadFolder, scopeId));
}
