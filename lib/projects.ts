import type { Project } from "@/types/project";

export const projects: Project[] = [
  {
    slug: "plex-lang",
    name: "Plex Language",
    tagline: "Linguagem com runtime, checker, CLI e LSP em uma toolchain única.",
    description:
      "Linguagem desenvolvida em Rust com arquitetura modular (lexer, parser, checker, runtime, LSP e CLI), com recursos nativos para agentes e integração AI multi-provider.",
    features: [
      "Toolchain completa com comando `plex` para check, run e LSP",
      "Manifesto `Plex.toml` com políticas de segurança e configuração de provider",
      "Exemplos reais com agents, imports, decorators HTTP e tool_loop",
    ],
    tags: ["language", "rust", "lsp", "agents", "multi-provider"],
    docsUrl: "https://github.com/MF07-Language-Programing/plex-lang/tree/main/docs",
    githubUrl: "https://github.com/MF07-Language-Programing/plex-lang",
    category: "tool",
    featured: true,
  },
  {
    slug: "strider-framework",
    name: "Strider Framework",
    tagline: "Django-inspired, FastAPI-powered backend framework.",
    description:
      "Framework Python para APIs REST de alta performance que combina produtividade estilo DRF com arquitetura async nativa e documentação automática.",
    features: [
      "ModelViewSet + AutoRouter para CRUD completo com baixo boilerplate",
      "SQLAlchemy 2.0 async e Pydantic v2 para tipagem forte e validação rápida",
      "Sistema plug-and-play para auth, messaging, tasks e tenancy",
    ],
    tags: ["framework", "python", "fastapi", "django-style", "async"],
    docsUrl: "https://sorputi.github.io/core-framework/",
    githubUrl: "https://github.com/SorPuti/core-framework",
    category: "tool",
    featured: true,
  },
  {
    slug: "core-framework-mcp-server",
    name: "Core Framework MCP Server",
    tagline: "MCP semântico com guardrails para Strider.",
    description:
      "Servidor MCP que expõe busca semântica, validação segura de ações e geração de queries orientadas a abstrações do framework.",
    features: [
      "Indexação de docs e código com foco em assistência de engenharia",
      "Fluxo explícito de delegação entre MCP remoto e agente local",
      "Guardrails para bloquear execuções críticas sem confirmação",
    ],
    tags: ["mcp", "developer-tools", "search", "guardrails"],
    docsUrl: "https://github.com/SorPuti/core-framework/tree/main/mcp-server",
    githubUrl: "https://github.com/SorPuti/core-framework/tree/main/mcp-server",
    category: "tool",
    featured: true,
  },
  {
    slug: "plex-cli",
    name: "Plex CLI",
    tagline: "CLI unificada para compile, check, run e gestão de manifesto.",
    description:
      "Interface de linha de comando da linguagem Plex com subcomandos para toolchain, projeto, pacotes, compilação, verificação estática e execução.",
    features: [
      "Comandos `project` e `pkg` para manifesto e lock de dependências",
      "Integração com checker e runtime da linguagem",
      "Subcomando `lsp` para integração com editores",
    ],
    tags: ["cli", "toolchain", "compiler", "lsp", "manifest"],
    docsUrl: "https://github.com/MF07-Language-Programing/plex-lang/tree/main/cli",
    githubUrl: "https://github.com/MF07-Language-Programing/plex-lang/tree/main/cli",
    category: "library",
    featured: true,
  },
  {
    slug: "plex-lsp",
    name: "Plex LSP",
    tagline: "Language Server para experiência de desenvolvimento de Plex.",
    description:
      "Servidor de linguagem dedicado com diagnósticos, suporte a strict_types e integração com o manifesto Plex para decisões de análise.",
    features: [
      "Integração com checker para feedback estático",
      "Leitura de `Plex.toml` para comportamento contextual",
      "Base para autocomplete e tooling de IDE",
    ],
    tags: ["lsp", "editor", "dx", "static-analysis"],
    docsUrl: "https://github.com/MF07-Language-Programing/plex-lang/tree/main/lsp",
    githubUrl: "https://github.com/MF07-Language-Programing/plex-lang/tree/main/lsp",
    category: "experiment",
    featured: true,
  },
  {
    slug: "stride-workers-messaging",
    name: "Stride Workers & Messaging",
    tagline: "Processamento assíncrono e integração com brokers no ecossistema Strider.",
    description:
      "Camada operacional do core-framework para tarefas em background, workers e integração com Kafka, Redis e RabbitMQ.",
    features: [
      "Workers de background para cargas não síncronas",
      "Integração orientada a eventos com filas e brokers",
      "Configuração por settings plug-and-play",
    ],
    tags: ["workers", "messaging", "kafka", "redis", "rabbitmq"],
    docsUrl: "https://sorputi.github.io/core-framework/",
    githubUrl: "https://github.com/SorPuti/core-framework",
    category: "library",
    featured: false,
  },
];

export function getFeaturedProjects(limit = 6): Project[] {
  return projects.filter((project) => project.featured).slice(0, limit);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getAllProjectTags(): string[] {
  return [...new Set(projects.flatMap((project) => project.tags))].sort();
}
