import type { Metadata } from "next";
import { AuthBenefitPanel } from "@/components/auth-benefit-panel";
import { AuthForms } from "@/components/auth-forms";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a Synthosia account with email, Google, or GitHub.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-dvh py-4 sm:py-6 lg:py-7">
      <Container className="max-w-[1440px]">
        <section className="grid min-h-[calc(100dvh-3.5rem)] gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch xl:gap-5">
          <AuthBenefitPanel
            eyebrow="Account creation"
            title="One account connects the developer platform."
            description="Create one identity for projects, CLI context, keys, and integrations."
            benefits={[
              "Link repositories once.",
              "Prepare keys and integrations early.",
              "Use Google or GitHub later.",
            ]}
            alternateHref="/auth/login"
            alternateLabel="Already registered? Sign in"
          />

          <AuthForms mode="register" />
        </section>
      </Container>
    </div>
  );
}
