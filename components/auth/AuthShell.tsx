import Link from "next/link";
import Image from "next/image";

export default function AuthShell({
  tagline,
  title,
  subtitle,
  children,
  footer,
}: {
  tagline: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/asset/tofiza.png"
              alt="Tofiza Tours &amp; Travels"
              width={340}
              height={100}
              priority
              className="h-10 w-auto object-contain brightness-0 invert mx-auto"
            />
          </Link>
          <p className="text-brand-200 text-sm mt-2">{tagline}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{title}</h1>
          {subtitle && <p className="text-slate-500 text-sm mb-6">{subtitle}</p>}
          <div className={subtitle ? "" : "mt-6"}>{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
