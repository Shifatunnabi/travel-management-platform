"use client";

import { useState, useTransition } from "react";
import { Loader2, UserCheck, UserX } from "lucide-react";
import { setUserStatusAction } from "@/lib/actions/admin";

export default function UserStatusToggle({
  userId,
  suspended,
}: {
  userId: string;
  suspended: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex items-center gap-1.5">
      {error && <span className="text-[11px] text-rose-600">{error}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const result = await setUserStatusAction(userId, !suspended);
            if (!result.ok) setError(result.message ?? "Failed");
          })
        }
        title={suspended ? "Reinstate account" : "Suspend account"}
        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
          suspended
            ? "text-emerald-600 hover:bg-emerald-50"
            : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
        }`}
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : suspended ? <UserCheck size={15} /> : <UserX size={15} />}
      </button>
    </span>
  );
}
