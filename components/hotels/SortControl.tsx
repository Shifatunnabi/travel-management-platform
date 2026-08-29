"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SortAsc } from "lucide-react";

const OPTIONS = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest rated" },
  { value: "reviews", label: "Most reviewed" },
];

export default function SortControl({ params }: { params: { sort?: string } }) {
  const router = useRouter();
  const search = useSearchParams();

  return (
    <label className="flex items-center gap-2 bg-white border border-slate-200 hover:border-brand-400 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors cursor-pointer shrink-0">
      <SortAsc size={15} className="text-brand-500" aria-hidden="true" />
      <span className="sr-only">Sort results</span>
      <select
        value={params.sort ?? "price-asc"}
        onChange={(e) => {
          const next = new URLSearchParams(search.toString());
          next.set("sort", e.target.value);
          router.push(`/hotels/search?${next}`);
        }}
        className="bg-transparent outline-none cursor-pointer pr-1"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
