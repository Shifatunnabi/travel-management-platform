import Link from "next/link";
import Image from "next/image";

export function PageHeader({
  title,
  subtitle,
  action,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}) {
  return (
    <div className="mb-6">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          {breadcrumb.map((c, i) => (
            <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-300">/</span>}
              {c.href ? (
                <Link href={c.href} className="hover:text-brand-600 transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span className="text-slate-700 font-medium">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function Card({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white rounded-2xl border border-slate-200 ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div>
            {title && <h2 className="font-bold text-slate-900 text-sm">{title}</h2>}
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "brand",
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "brand" | "emerald" | "amber" | "rose" | "slate";
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    slate: "bg-slate-100 text-slate-600",
  } as const;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{value}</p>
          {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}

const STATUS_TONES: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",

  pending: "bg-amber-50 text-amber-700 border-amber-200",
  pending_review: "bg-amber-50 text-amber-700 border-amber-200",
  pending_payment: "bg-amber-50 text-amber-700 border-amber-200",
  requested: "bg-amber-50 text-amber-700 border-amber-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  checked_in: "bg-brand-50 text-brand-700 border-brand-200",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
  expired: "bg-slate-100 text-slate-600 border-slate-200",
  hidden: "bg-slate-100 text-slate-600 border-slate-200",

  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  suspended: "bg-rose-50 text-rose-700 border-rose-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  no_show: "bg-rose-50 text-rose-700 border-rose-200",
  refunded: "bg-purple-50 text-purple-700 border-purple-200",
};

export function StatusPill({ status }: { status: string }) {
  const tone = STATUS_TONES[status] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-semibold capitalize ${tone}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="text-center py-14 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Icon size={24} className="text-slate-400" />
        </div>
      )}
      <p className="font-bold text-slate-900">{title}</p>
      <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-sm min-w-[640px]">{children}</table>
    </div>
  );
}

export function Th({ children, align = "left" }: { children?: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={`${align === "right" ? "text-right" : "text-left"} text-[11px] uppercase tracking-wider font-semibold text-slate-400 pb-3 px-2 whitespace-nowrap`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className = "",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td className={`py-3 px-2 align-top ${align === "right" ? "text-right" : "text-left"} ${className}`}>
      {children}
    </td>
  );
}

export function Thumb({ src, alt, size = 44 }: { src?: string; alt: string; size?: number }) {
  if (!src) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-lg bg-slate-100 shrink-0"
        aria-hidden="true"
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-lg object-cover shrink-0"
      style={{ width: size, height: size }}
    />
  );
}
