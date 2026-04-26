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

export type GithubProfile = {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
};

export type GithubMention = {
  profile: GithubProfile;
  repositories: GithubRepository[];
};

const DEFAULT_USERNAME = "lucas";

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN;

  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getGithubRepositories(limit = 6, username = process.env.GITHUB_USERNAME ?? DEFAULT_USERNAME): Promise<GithubRepository[]> {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
    {
      headers: githubHeaders(),
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

export async function getGithubProfile(username: string): Promise<GithubProfile | null> {
  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: githubHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as GithubProfile;
}

export async function getGithubMention(username: string, repositoryLimit = 4): Promise<GithubMention | null> {
  const [profile, repositories] = await Promise.all([
    getGithubProfile(username),
    getGithubRepositories(repositoryLimit, username),
  ]);

  if (!profile) {
    return null;
  }

  return { profile, repositories };
}
