import type { Metadata } from "next";
import { AuthBenefitPanel } from "@/components/auth-benefit-panel";
import { AuthForms } from "@/components/auth-forms";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Synthosia account with email, Google, or GitHub.",
};

export default function LoginPage() {
  return (
    <div className="min-h-dvh py-4 sm:py-6 lg:py-7">
      <Container className="max-w-[1440px]">
        <section className="grid min-h-[calc(100dvh-3.5rem)] gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch xl:gap-5">
          <AuthBenefitPanel
            eyebrow="Account login"
            title="Your platform control room is waiting."
            description="Go straight to projects, keys, integrations, and CLI context."
            benefits={[
              "Connected projects stay available.",
              "API keys live under one account.",
              "Google/GitHub access stays ready.",
            ]}
            alternateHref="/auth/register"
            alternateLabel="Need an account? Create one"
          />

          <AuthForms mode="login" />
        </section>
      </Container>
    </div>
  );
}
