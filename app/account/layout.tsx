import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NavbarFallback from "@/components/layout/NavbarFallback";
import AccountMenu, { AuthButtons } from "@/components/layout/AccountMenu";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import VerifyEmailBanner from "@/components/dashboard/VerifyEmailBanner";
import { requireUser } from "@/lib/auth/guards";


export default function AccountLayout({ children }: { children: React.ReactNode }) {
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
      <div className="min-h-screen bg-slate-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={null}>
            <AccountBanner />
          </Suspense>
          <div className="flex flex-col lg:flex-row gap-6">
            <Suspense fallback={<SidebarSkeleton />}>
              <AccountSidebar />
            </Suspense>
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

async function AccountBanner() {
  const user = await requireUser();
  if (user.isEmailVerified) return null;
  return <VerifyEmailBanner email={user.email ?? ""} />;
}

async function AccountSidebar() {
  const user = await requireUser();
  return (
    <DashboardSidebar
      name={user.name ?? "Traveller"}
      email={user.email ?? ""}
      avatar={user.image}
    />
  );
}

function SidebarSkeleton() {
  return (
    <div className="lg:w-64 shrink-0" aria-hidden="true">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 h-96 animate-pulse" />
    </div>
  );
}
