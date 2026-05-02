import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountWorkspace } from "@/components/account-workspace";
import { AccountShellSkeleton } from "@/components/account-shell-skeleton";
import { parseAccountPanelSearchParams } from "@/lib/account-panel-url";

export const metadata: Metadata = {
  title: "Account",
  description: "Synthosia account workspace for projects, API keys, integrations, and CLI connections.",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{
    cat?: string | string[] | undefined;
    section?: string | string[] | undefined;
    cloud?: string | string[] | undefined;
    view?: string | string[] | undefined;
  }>;
}) {
  const sp = await searchParams;
  const cat = Array.isArray(sp.cat) ? sp.cat[0] : sp.cat;
  const section = Array.isArray(sp.section) ? sp.section[0] : sp.section;
  const cloud = Array.isArray(sp.cloud) ? sp.cloud[0] : sp.cloud;
  const view = Array.isArray(sp.view) ? sp.view[0] : sp.view;
  const initial = parseAccountPanelSearchParams({ cat, section, cloud, view });

  return (
    <div className="min-h-dvh">
      <Suspense fallback={<AccountShellSkeleton />}>
        <AccountWorkspace
          initialCategory={initial.category}
          initialSection={initial.section}
          initialCloudBindingId={initial.cloudBindingId}
          initialInstanceDetailTab={initial.instanceDetailTab}
        />
      </Suspense>
    </div>
  );
}
