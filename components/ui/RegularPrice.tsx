import { formatCurrency } from "@/lib/utils/formatters";

/**
 * The room's regular price, crossed out, with how much the guest saves. Renders
 * nothing unless the regular price is actually above what is being charged.
 */
export default function RegularPrice({
  regular,
  price,
  currency = "BDT",
  className = "",
}: {
  regular: number | null | undefined;
  price: number;
  currency?: string;
  className?: string;
}) {
  if (regular == null || price <= 0 || regular <= price) return null;
  const pct = Math.round((1 - price / regular) * 100);
  return (
    <span className={`inline-flex items-baseline gap-1.5 text-xs tabular-nums ${className}`}>
      <s className="text-slate-400" aria-label={`Regular price ${formatCurrency(regular, currency)}`}>
        {formatCurrency(regular, currency)}
      </s>
      {pct > 0 && <span className="font-semibold text-emerald-600">{pct}% off</span>}
    </span>
  );
}
