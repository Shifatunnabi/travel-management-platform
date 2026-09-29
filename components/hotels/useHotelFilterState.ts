"use client";

import { useRouter, useSearchParams } from "next/navigation";

export interface HotelFiltersParams {
  stars?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  amenities?: string;
}

/**
 * Every filter is written to the URL, so a filtered result set is a
 * shareable link and the back button behaves the way people expect. Shared
 * by the desktop panel and the mobile drawer so both stay in sync with the
 * same URL-writing logic.
 */
export function useHotelFilterState(params: HotelFiltersParams) {
  const router = useRouter();
  const search = useSearchParams();

  const stars = (params.stars ?? "").split(",").filter(Boolean);
  const amenities = (params.amenities ?? "").split(",").filter(Boolean);

  const activeCount =
    stars.length +
    amenities.length +
    (params.minRating ? 1 : 0) +
    (params.minPrice ? 1 : 0) +
    (params.maxPrice ? 1 : 0);

  const apply = (key: string, value: string | null) => {
    const next = new URLSearchParams(search.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    router.push(`/hotels/search?${next}`);
  };

  const toggleIn = (key: string, current: string[], value: string) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    apply(key, next.join(","));
  };

  const clearAll = () => {
    const next = new URLSearchParams(search.toString());
    ["stars", "minPrice", "maxPrice", "minRating", "amenities"].forEach((k) => next.delete(k));
    router.push(`/hotels/search?${next}`);
  };

  return { stars, amenities, activeCount, apply, toggleIn, clearAll };
}
