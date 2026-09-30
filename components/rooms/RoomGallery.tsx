"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cdn } from "@/lib/utils/cdn";

const AUTOPLAY_MS = 4000;
const WIDE = "(min-width: 640px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Two photos side by side on wider screens, one on a phone. */
function usePerView(): number {
  return useSyncExternalStore(
    subscribe,
    () => (window.matchMedia(WIDE).matches ? 2 : 1),
    () => 1,
  );
}

/** Slides by itself, one photo at a time, and stops while someone is looking. */
export default function RoomGallery({
  images,
  name,
}: {
  images: { url: string; alt: string }[];
  name: string;
}) {
  const perView = usePerView();
  const maxIndex = Math.max(0, images.length - perView);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = Math.min(index, maxIndex);

  useEffect(() => {
    if (paused || maxIndex === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setIndex((i) => (Math.min(i, maxIndex) >= maxIndex ? 0 : i + 1)),
      AUTOPLAY_MS,
    );
    return () => window.clearInterval(timer);
  }, [paused, maxIndex]);

  if (images.length === 0) {
    return <div className="aspect-[3/1] bg-stone-100 rounded-2xl" aria-hidden="true" />;
  }

  const step = (dir: 1 | -1) =>
    setIndex(() => {
      const next = current + dir;
      return next < 0 ? maxIndex : next > maxIndex ? 0 : next;
    });

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${name} photos`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${(current * 100) / Math.min(perView, images.length)}%)` }}
        >
          {images.map((img, i) => {
            const visible = i >= current && i < current + perView;
            return (
              <div
                key={img.url + i}
                className={`relative aspect-[3/2] shrink-0 basis-full ${images.length > 1 ? "sm:basis-1/2" : ""} border-x-2 border-transparent bg-stone-100`}
                aria-hidden={!visible}
              >
                <Image
                  src={cdn(img.url, 800, 534)}
                  alt={img.alt || name}
                  fill
                  priority={i < 2}
                  sizes="(max-width: 640px) 100vw, 400px"
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>

      {maxIndex > 0 && (
        <>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous photo"
            className="absolute left-7 top-1/2 -translate-y-1/2 w-[60px] h-[60px] max-sm:w-10 max-sm:h-10 max-sm:left-3 rounded-full bg-white text-stone-900 shadow-md flex items-center justify-center hover:scale-105 transition-transform"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next photo"
            className="absolute right-7 top-1/2 -translate-y-1/2 w-[60px] h-[60px] max-sm:w-10 max-sm:h-10 max-sm:right-3 rounded-full bg-white text-stone-900 shadow-md flex items-center justify-center hover:scale-105 transition-transform"
          >
            <ChevronRight size={18} />
          </button>

          <div className="flex justify-center mt-7 max-sm:mt-3 flex-wrap">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === current}
                className="group w-8 h-8 flex items-center justify-center"
              >
                <span
                  className={`block w-[7px] h-[7px] rounded-full transition-colors ${
                    i === current ? "bg-stone-800" : "bg-stone-300 group-hover:bg-stone-400"
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
