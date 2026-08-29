"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function VendorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[vendor]", error);
  }, [error]);

  return (
    <div className="bg-white rounded-2xl border border-rose-200 p-6">
      <div className="flex gap-3">
        <AlertTriangle size={20} className="text-rose-500 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="font-bold text-slate-900">This section could not load</p>
          <p className="text-sm text-slate-500 mt-1">
            {error.message || "Something went wrong on our side."}
          </p>
          {error.digest && (
            <p className="text-[11px] text-slate-400 mt-1 font-mono">ref {error.digest}</p>
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
