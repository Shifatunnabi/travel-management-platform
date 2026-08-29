"use client";

import { useState, useTransition } from "react";
import { Send, EyeOff, Eye, Loader2 } from "lucide-react";
import { setHotelVisibilityAction, submitHotelAction } from "@/lib/actions/vendor";

export default function HotelRowActions({
  hotelId,
  status,
  roomCount,
  imageCount,
}: {
  hotelId: string;
  status: string;
  roomCount: number;
  imageCount: number;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; message?: string }>) =>
    start(async () => {
      setError(null);
      const result = await fn();
      if (!result.ok) setError(result.message ?? "Something went wrong.");
    });

  const canSubmit = roomCount > 0 && imageCount >= 3;

  return (
    <span className="inline-flex items-center gap-1">
      {pending && <Loader2 size={14} className="animate-spin text-slate-400" />}

      {(status === "draft" || status === "rejected") && (
        <button
          type="button"
          disabled={pending || !canSubmit}
          onClick={() => run(() => submitHotelAction(hotelId))}
          title={
            canSubmit
              ? "Submit for review"
              : roomCount === 0
                ? "Add at least one room first"
                : "Add at least three photos first"
          }
          className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
        >
          <Send size={15} />
        </button>
      )}

      {status === "published" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setHotelVisibilityAction(hotelId, false))}
          title="Pause — removes it from search"
          className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
        >
          <EyeOff size={15} />
        </button>
      )}

      {status === "draft" && roomCount > 0 && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setHotelVisibilityAction(hotelId, true))}
          title="Re-list — sends it back for review"
          className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          <Eye size={15} />
        </button>
      )}

      {error && (
        <span role="alert" className="text-[11px] text-rose-600 max-w-40 text-left">
          {error}
        </span>
      )}
    </span>
  );
}
