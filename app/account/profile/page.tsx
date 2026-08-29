import { Suspense } from "react";
import { ShieldCheck, MailWarning } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/models/User";
import { Card } from "@/components/admin/Shell";
import ProfileForm from "@/components/account/ProfileForm";
import PasswordForm from "@/components/account/PasswordForm";

export default function ProfilePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">
          Your details, and the password you sign in with.
        </p>
      </div>
      <Suspense fallback={<div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body />
      </Suspense>
    </div>
  );
}

async function Body() {
  const sessionUser = await requireUser();
  await connectDB();
  const user = await User.findById(sessionUser.id)
    .select("name email phone nationality dateOfBirth emailVerifiedAt")
    .lean();
  if (!user) return null;

  return (
    <div className="space-y-5">
      <Card
        title="Your details"
        action={
          user.emailVerifiedAt ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <ShieldCheck size={13} /> Email verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              <MailWarning size={13} /> Not verified
            </span>
          )
        }
      >
        <ProfileForm
          initial={{
            name: user.name,
            email: user.email,
            phone: user.phone ?? "",
            nationality: user.nationality ?? "",
            dateOfBirth: user.dateOfBirth ?? "",
          }}
        />
      </Card>

      <Card title="Password" description="Use something you have not used elsewhere.">
        <PasswordForm />
      </Card>
    </div>
  );
}
