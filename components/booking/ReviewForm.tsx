"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReviewAction } from "@/lib/actions/review";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";

const TRIP_TYPES = ["Couple", "Family", "Solo", "Business", "Friends"];

export default function ReviewForm({
  bookingRef,
  hotelName,
  open: initiallyOpen = false,
}: {
  bookingRef: string;
  hotelName: string;
  open?: boolean;
}) {
  const [state, action] = useActionState(submitReviewAction, idleState);
  const [open, setOpen] = useState(initiallyOpen);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const e = state.ok ? undefined : state.fieldErrors;

  if (state.ok && state.message) {
    return <ActionMessage state={state} />;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
      >
        <Star size={13} /> Write a review
      </button>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="ref" value={bookingRef} />
      <input type="hidden" name="rating" value={rating} />
      <ActionMessage state={state} />

      <p className="text-sm font-semibold text-slate-800">How was {hotelName}?</p>

      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            aria-pressed={rating === n}
            className="p-0.5"
          >
            <Star
              size={22}
              className={
                n <= (hover || rating)
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-300"
              }
            />
          </button>
        ))}
        {rating > 0 && <span className="ml-2 text-sm text-slate-500 tabular-nums">{rating}/5</span>}
      </div>
      {e?.rating && <p className="text-xs text-rose-600">{e.rating[0]}</p>}

      <input
        name="title"
        placeholder="Sum it up in a few words (optional)"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500"
      />

      <div>
        <textarea
          name="body"
          rows={4}
          required
          minLength={20}
          placeholder="What was the room like? How was the service? Would you go back?"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 resize-y"
        />
        {e?.body && <p className="mt-1 text-xs text-rose-600">{e.body[0]}</p>}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TRIP_TYPES.map((t) => (
          <label
            key={t}
            className="cursor-pointer select-none px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-brand-300 has-checked:bg-brand-600 has-checked:text-white has-checked:border-brand-600"
          >
            <input type="radio" name="tripType" value={t} className="sr-only" />
            {t}
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel="Sending..." size="sm">Submit review</SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Not now
        </button>
      </div>
      <p className="text-[11px] text-slate-400">
        Reviews are checked before they appear. Only completed stays can be reviewed.
      </p>
    </form>
  );
}
