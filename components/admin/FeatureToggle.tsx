"use client";

import { useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { setHotelFeatureAction } from "@/lib/actions/admin";

export default function FeatureToggle({
  hotelId,
  featured,
}: {
  hotelId: string;
  featured: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => void (await setHotelFeatureAction(hotelId, !featured)))}
      title={featured ? "Remove from homepage" : "Feature on homepage"}
      className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
        featured
          ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
          : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
      }`}
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
    </button>
  );
}
