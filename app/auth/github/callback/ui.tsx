"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/container";
import { exchangeGithubOAuth } from "@/lib/synthosia-api";

export function GitHubCallbackClient({ code, state }: { code?: string; state?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("Completing GitHub OAuth...");

  useEffect(() => {
    if (!code || !state) {
      router.replace("/auth/login?oauth_error=github_missing_params");
      return;
    }

    exchangeGithubOAuth({ code, state })
      .then(() => router.replace("/account"))
      .catch((error) => setMessage(error instanceof Error ? error.message : "GitHub OAuth failed."));
  }, [code, router, state]);

  return (
    <div className="min-h-dvh py-6">
      <Container className="max-w-[900px]">
        <div className="surface-panel rounded-[24px] p-6 text-center sm:p-10">
          <p className="font-display text-xs uppercase brand-accent">GitHub OAuth</p>
          <h1 className="mt-4 text-balance font-display text-[2rem] leading-[1.05] text-primary sm:text-[2.4rem]">
            Connecting your account
          </h1>
          <p className="mt-4 font-serif text-[1.05rem] text-secondary">{message}</p>
        </div>
      </Container>
    </div>
  );
}

