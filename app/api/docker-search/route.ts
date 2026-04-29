import { NextResponse } from "next/server";

type HubResult = { repo_name: string; repo_description?: string | null };

/**
 * Proxy para a pesquisa pública do Docker Hub (evita CORS no browser).
 * GET /api/docker-search?q=nginx
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] satisfies { name: string; description: string }[] });
  }

  const hubUrl = `https://hub.docker.com/v2/search/repositories/?query=${encodeURIComponent(q)}&page_size=15`;
  const res = await fetch(hubUrl, {
    headers: { Accept: "application/json" },
    next: { revalidate: 120 },
  });

  if (!res.ok) {
    return NextResponse.json({ results: [], error: "hub_unavailable" }, { status: 502 });
  }

  const data = (await res.json()) as { results?: HubResult[] };
  const results = (data.results ?? []).map((r) => ({
    name: r.repo_name,
    description: (r.repo_description ?? "").slice(0, 160),
  }));

  return NextResponse.json({ results });
}
