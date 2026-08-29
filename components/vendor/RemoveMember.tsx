"use client";

import { useState, useTransition } from "react";
import { Loader2, UserMinus } from "lucide-react";
import { removeTeamMemberAction } from "@/lib/actions/team";

export default function RemoveMember({ userId, name }: { userId: string; name: string }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (error) return <span className="text-[11px] text-rose-600">{error}</span>;

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const result = await removeTeamMemberAction(userId);
              if (!result.ok) setError(result.message ?? "Failed");
            })
          }
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
        >
          {pending ? <Loader2 size={13} className="animate-spin" /> : "Remove"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          Keep
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      title={`Remove ${name}`}
      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
    >
      <UserMinus size={15} />
    </button>
  );
}
