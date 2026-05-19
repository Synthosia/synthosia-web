import type { Metadata } from "next";
import { AuthBenefitPanel } from "@/components/auth-benefit-panel";
import { AuthForms } from "@/components/auth-forms";
import { Container } from "@/components/container";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Synthosia account with email, Google, or GitHub.",
};

export default async function LoginPage() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return (
    <div className="min-h-dvh py-4 sm:py-6 lg:py-7">
      <Container className="max-w-[1440px]">
        <section className="grid min-h-[calc(100dvh-3.5rem)] gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch xl:gap-5">
          <AuthBenefitPanel
            eyebrow={dictionary.auth.signInEyebrow}
            title={dictionary.auth.signInTitle}
            description={dictionary.auth.signInBody}
            benefits={[
              "Connected projects stay available.",
              "API keys live under one account.",
              "Google/GitHub access stays ready.",
            ]}
            alternateHref="/auth/register"
            alternateLabel={dictionary.auth.needCreateAccountLabel}
            secureAccessLabel={dictionary.auth.secureAccess}
            featureItems={dictionary.auth.authFeatures}
          />

          <AuthForms mode="login" />
        </section>
      </Container>
    </div>
  );
}
