import Link from "next/link";
import { LogIn } from "lucide-react";

export default function Unauthorized() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
          <LogIn size={28} className="text-brand-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Please sign in</h1>
        <p className="text-slate-500 text-sm mb-6">
          This page needs an account. Sign in and we will bring you straight back.
        </p>
        <Link
          href="/auth/login"
          className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
