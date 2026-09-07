"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Shows exactly one card at a time and advances on its own, pausing while the
 * pointer is over it or a control has focus. Slides stay mounted so the images
 * are already decoded when their turn comes.
 */
export default function Carousel({
  label,
  count,
  autoplayMs = 6000,
  children,
}: {
  label: string;
  count: number;
  autoplayMs?: number;
  children: React.ReactNode[];
}) {
  const [raw, setIndex] = useState(0);
  // Clamped during render rather than corrected in an effect, so removing the
  // last slide cannot leave a frame pointing past the end.
  const index = count > 0 ? Math.min(raw, count - 1) : 0;
  const [paused, setPaused] = useState(false);
  const id = useId();
  const touchStart = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), autoplayMs);
    return () => clearInterval(timer);
  }, [paused, count, autoplayMs]);

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        touchStart.current = null;
      }}
    >
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {children.map((child, i) => (
            <div
              key={i}
              id={`${id}-slide-${i}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== index}
              className="w-full shrink-0"
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <>
          <NavButton side="left" label={`Previous ${label}`} onClick={() => go(index - 1)} />
          <NavButton side="right" label={`Next ${label}`} onClick={() => go(index + 1)} />

          <div className="flex items-center justify-center gap-2 mt-5">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to ${label} ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-brand-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NavButton({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white hover:text-brand-600 transition-colors ${
        side === "left" ? "left-3 sm:-left-5" : "right-3 sm:-right-5"
      }`}
    >
      <Icon size={18} />
    </button>
  );
}
