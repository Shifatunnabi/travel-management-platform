"use client";

import { useState, useTransition } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { verifyVendorBankAction } from "@/lib/actions/admin";

export default function VerifyBankButton({ vendorId }: { vendorId: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await verifyVendorBankAction(vendorId);
            setMessage(result.message ?? null);
          })
        }
        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
        Mark verified
      </button>
      {message && <p className="mt-2 text-xs text-slate-600">{message}</p>}
    </div>
  );
}
