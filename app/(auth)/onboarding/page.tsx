import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding-flow";

export const metadata: Metadata = {
  title: "Welcome to Synthosia",
  description: "Get started with your Synthosia account.",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-dvh overflow-hidden bg-[#f2f1ed]">
      <OnboardingFlow />
    </div>
  );
}
