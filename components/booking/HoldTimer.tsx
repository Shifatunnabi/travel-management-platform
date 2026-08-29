"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

/**
 * Counts down the inventory hold. Starts from a server-supplied number of
 * seconds rather than an absolute time, so a wrong device clock cannot make
 * the room look held when it is not.
 */
export default function HoldTimer({ secondsLeft }: { secondsLeft: number }) {
  // Counts elapsed seconds rather than mirroring the prop into state, so a new
  // server value flows straight through without an effect to resynchronise.
  const [elapsed, setElapsed] = useState(0);
  const left = Math.max(0, secondsLeft - elapsed);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  if (left <= 0) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex gap-2.5">
        <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-rose-800">
          Your hold has expired. Start again to check current availability.
        </p>
      </div>
    );
  }

  const minutes = Math.floor(left / 60);
  const seconds = left % 60;
  const urgent = left < 180;

  return (
    <div
      role="timer"
      className={`rounded-2xl border px-4 py-3 flex items-center gap-2.5 ${
        urgent ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"
      }`}
    >
      <Clock size={16} className={urgent ? "text-amber-600" : "text-slate-400"} aria-hidden="true" />
      <p className={`text-sm ${urgent ? "text-amber-800" : "text-slate-600"}`}>
        Room held for{" "}
        <span className="font-bold tabular-nums">
          {minutes}:{String(seconds).padStart(2, "0")}
        </span>
      </p>
    </div>
  );
}
