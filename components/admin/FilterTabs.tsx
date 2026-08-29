import Link from "next/link";

/** Filters live in the URL, so a filtered view is a shareable link. */
export default function FilterTabs({
  basePath,
  param,
  current,
  tabs,
}: {
  basePath: string;
  param: string;
  current: string;
  tabs: { value: string; label: string; count?: number }[];
}) {
  return (
    <nav className="flex flex-wrap gap-1.5">
      {tabs.map((t) => {
        const active = t.value === current;
        return (
          <Link
            key={t.value}
            href={`${basePath}?${param}=${t.value}`}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              active
                ? "bg-brand-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-brand-300"
            }`}
          >
            {t.label}
            {t.count != null && t.count > 0 && (
              <span
                className={`text-[11px] tabular-nums px-1.5 rounded-full ${
                  active ? "bg-white/20" : "bg-slate-100 text-slate-500"
                }`}
              >
                {t.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
