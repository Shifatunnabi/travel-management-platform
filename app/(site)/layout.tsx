import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NavbarFallback from "@/components/layout/NavbarFallback";
import AccountMenu, { AuthButtons } from "@/components/layout/AccountMenu";

/**
 * Chrome for every public page.
 *
 * Navbar sits behind Suspense because it reads `usePathname()`, which cannot
 * resolve while prerendering a dynamic route. The account control is a second,
 * inner boundary: it reads the session, so only that fragment defers to request
 * time while the rest of the page stays in the static shell.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
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
      {children}
      <Footer />
    </>
  );
}
