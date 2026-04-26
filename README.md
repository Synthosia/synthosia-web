# Synthosia Ecosystem

Modern website built with Next.js App Router to represent Synthosia — a founder-led AI-native product ecosystem by SorPuti (Lucas):

- **Plex Language** (AI-native language/toolchain built in Rust)
- **Strider Framework** from core-framework (Django-inspired ergonomics + FastAPI performance)
- **Open-source tools** and experimental projects

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Image optimization with Next.js Image
- Component-based architecture
- Dynamic project pages via slug
- GitHub API integration for repository discovery and real-time sync

## Routes

- `/` Home ecosystem landing
- `/platform` Ecosystem architecture and connection flow
- `/language` AI-native language overview
- `/framework` Backend framework positioning and benchmarks
- `/opensource` Filterable/searchable open source hub
- `/projects/[slug]` Dynamic project details
- `/about` SorPuti: founder identity, vision, and ecosystem philosophy

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## GitHub Integration

Optional environment variables:

```bash
GITHUB_USERNAME=SorPuti
GITHUB_TOKEN=ghp_xxx_optional_for_rate_limits
```

- `GITHUB_USERNAME` controls which repos are fetched for the GitHub Live section.
- `GITHUB_TOKEN` is optional and helps avoid strict API rate limits.

## Domain

Deployed at **synthosia.com**

## Architecture Notes

- Reusable UI components live in `components/`.
- Data model and project content live in `lib/projects.ts` and `types/project.ts`.
- GitHub fetching and caching logic lives in `lib/github.ts`.
- The foundation is CMS-ready: project data is centralized and can be swapped for MDX/CMS sources later.
