import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./config";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/models/User";
import { Vendor, VendorMember } from "@/lib/models/Vendor";
import { credentialsSchema } from "@/lib/validation/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase() })
          .select("+passwordHash")
          .lean();

        // Hash a dummy value when the user is missing so a failed lookup takes
        // roughly as long as a wrong password — no user enumeration by timing.
        if (!user) {
          await bcrypt.compare(password, "$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva");
          return null;
        }
        if (user.status === "suspended") return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        let vendorId: string | undefined;
        let vendorRole: "owner" | "manager" | "staff" | undefined;
        let vendorStatus: string | undefined;

        if (user.role === "vendor") {
          const membership = await VendorMember.findOne({ userId: user._id }).lean();
          if (membership) {
            vendorId = String(membership.vendorId);
            vendorRole = membership.role;
            const vendor = await Vendor.findById(membership.vendorId).select("status").lean();
            vendorStatus = vendor?.status;
          }
        }

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
          platformRole: user.platformRole,
          vendorId,
          vendorRole,
          vendorStatus,
          isEmailVerified: Boolean(user.emailVerifiedAt),
        };
      },
    }),
  ],
});
