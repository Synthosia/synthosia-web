import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome to Synthosia",
  description: "Get started with your Synthosia account.",
};

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-[var(--surface-200)] text-[var(--text-primary)] min-h-dvh">
      {children}
    </div>
  );
}
