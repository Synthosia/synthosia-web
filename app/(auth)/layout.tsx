import React from "react";
import { AmbientBackground } from "@/components/ambient-background";
import { NavigationProgress } from "@/components/navigation-progress";
import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="platform-shell flex min-h-dvh flex-col surface-page">
      <NavigationProgress />
      <AmbientBackground />
      <SiteHeader />
      <PageTransition>{children}</PageTransition>
      <SiteFooter />
    </div>
  );
}
