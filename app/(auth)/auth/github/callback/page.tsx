import { GitHubCallbackClient } from "@/app/(auth)/auth/github/callback/ui";

export const dynamic = "force-dynamic";

export default async function GitHubCallbackPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const code = typeof params.code === "string" ? params.code : undefined;
  const state = typeof params.state === "string" ? params.state : undefined;

  return <GitHubCallbackClient code={code} state={state} />;
}

