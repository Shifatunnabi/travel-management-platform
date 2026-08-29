import { Suspense } from "react";
import { PageHeader, Card } from "@/components/admin/Shell";
import { requirePlatform } from "@/lib/auth/guards";
import { readSettings } from "@/lib/services/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader title="Platform settings" subtitle="Defaults that apply everywhere unless a vendor has its own rate." />
      <Suspense fallback={<div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <Body />
      </Suspense>
    </>
  );
}

async function Body() {
  await requirePlatform(["super_admin"]);
  const settings = await readSettings();
  return (
    <Card>
      <SettingsForm initial={settings} />
    </Card>
  );
}
