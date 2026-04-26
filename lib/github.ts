export type GithubRepository = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  homepage: string | null;
  fork: boolean;
};

const DEFAULT_USERNAME = "lucas";

export async function getGithubRepositories(limit = 6): Promise<GithubRepository[]> {
  const username = process.env.GITHUB_USERNAME ?? DEFAULT_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  const response = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    return [];
  }

  const repositories = (await response.json()) as GithubRepository[];

  return repositories
    .filter((repository) => !repository.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, limit);
}
