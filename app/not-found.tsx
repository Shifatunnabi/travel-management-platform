import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import NavbarFallback from "@/components/layout/NavbarFallback";
import AccountMenu, { AuthButtons } from "@/components/layout/AccountMenu";
import Footer from "@/components/layout/Footer";
import { CONTACT } from "@/lib/config/contact";

/**
 * Shown for any URL that matches no route. The root `app/not-found.tsx` is
 * rendered inside the root layout, not the (site) route group, so the shared
 * chrome has to be pulled in here directly rather than inherited.
 */
export default function NotFound() {
  return (
    <>
      <Suspense fallback={<NavbarFallback />}>
        <Navbar
          account={
            <Suspense fallback={<AuthButtons />}>
              <AccountMenu />
            </Suspense>
          }
          mobileAccount={
            <Suspense fallback={<AuthButtons variant="mobile" />}>
              <AccountMenu variant="mobile" />
            </Suspense>
          }
        />
      </Suspense>

      <main className="pt-16">
        <section className="relative isolate flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 sm:px-6 py-20 text-center">
          <Image
            src="/asset/404.jpg"
            alt=""
            fill
            priority
            className="-z-20 origin-top scale-125 object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,12,58,0.75) 0%, rgba(5,12,58,0.5) 45%, rgba(5,12,58,0.8) 100%)",
            }}
          />

          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Oops..!</p>
          <h1 className="mt-1 text-[6rem] sm:text-[9rem] lg:text-[15rem] font-extrabold leading-none tracking-tight text-white/25">
            404
          </h1>

          <p className="mt-6 lg:mt-4 text-sm sm:text-base lg:text-xl font-medium text-white/80">
            It seems that this page does not exist
          </p>

          <div className="mt-4 lg:mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 lg:px-10 lg:py-4 text-sm lg:text-lg font-semibold text-brand-700 shadow-lg transition-colors hover:bg-white/90"
            >
              Back to Home
            </Link>
            <a
              href={`tel:${CONTACT.phoneE164}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 px-8 py-3 lg:px-10 lg:py-4 text-sm lg:text-lg font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Phone size={16} className="lg:size-5" />
              Contact Support
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
