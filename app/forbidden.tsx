import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function Forbidden() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-5">
          <ShieldX size={28} className="text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">You cannot open this page</h1>
        <p className="text-slate-500 text-sm mb-6">
          Your account does not have access to this area. If you think it should, ask whoever
          manages your team to update your role.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Back to Tofiza
          </Link>
          <Link
            href="/account"
            className="border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            My account
          </Link>
        </div>
      </div>
    </main>
  );
}
