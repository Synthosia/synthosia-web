import { defaultLocale, type Locale } from "@/lib/i18n";
import type { Project } from "@/types/project";

const rawProjects: Project[] = [
  {
    slug: "plex-lang",
    name: "Plex Language",
    tagline: "A language with runtime, checker, CLI, and LSP in one toolchain.",
    description:
      "A Rust-based language with modular architecture for lexer, parser, checker, runtime, LSP, and CLI, built with native agent features and multi-provider AI integration.",
    features: [
      "Complete toolchain with the `plex` command for check, run, and LSP workflows",
      "`Plex.toml` manifest for safety policies and provider configuration",
      "Real examples with agents, imports, HTTP decorators, and tool_loop usage",
    ],
    tags: ["language", "rust", "lsp", "agents", "multi-provider"],
    docsUrl: "https://github.com/MF07-Language-Programing/plex-lang/tree/main/docs",
    githubUrl: "https://github.com/MF07-Language-Programing/plex-lang",
    category: "tool",
    featured: true,
    translations: {
      "pt-BR": {
        tagline: "Linguagem com runtime, checker, CLI e LSP em uma toolchain única.",
        description:
          "Linguagem desenvolvida em Rust com arquitetura modular para lexer, parser, checker, runtime, LSP e CLI, com recursos nativos para agentes e integração de IA multi-provider.",
        features: [
          "Toolchain completa com comando `plex` para check, run e fluxos de LSP",
          "Manifesto `Plex.toml` com políticas de segurança e configuração de providers",
          "Exemplos reais com agentes, imports, decorators HTTP e uso de tool_loop",
        ],
      },
    },
  },
  {
    slug: "strider-framework",
    name: "Strider Framework",
    tagline: "Django-inspired, FastAPI-powered backend framework.",
    description:
      "A Python framework for high-performance REST APIs that combines DRF-style productivity with native async architecture and automatic documentation.",
    features: [
      "ModelViewSet and AutoRouter for full CRUD with low boilerplate",
      "SQLAlchemy 2.0 async and Pydantic v2 for strong typing and fast validation",
      "Plug-and-play system for auth, messaging, tasks, and tenancy",
    ],
    tags: ["framework", "python", "fastapi", "django-style", "async"],
    docsUrl: "https://sorputi.github.io/core-framework/",
    githubUrl: "https://github.com/SorPuti/core-framework",
    category: "tool",
    featured: true,
    translations: {
      "pt-BR": {
        tagline: "Framework backend inspirado em Django e potencializado por FastAPI.",
        description:
          "Framework Python para APIs REST de alta performance que combina produtividade estilo DRF com arquitetura async nativa e documentação automática.",
        features: [
          "ModelViewSet e AutoRouter para CRUD completo com pouco boilerplate",
          "SQLAlchemy 2.0 async e Pydantic v2 para tipagem forte e validação rápida",
          "Sistema plug-and-play para auth, mensageria, tasks e tenancy",
        ],
      },
    },
  },
  {
    slug: "core-framework-mcp-server",
    name: "Core Framework MCP Server",
    tagline: "Semantic MCP with guardrails for Strider.",
    description:
      "An MCP server that exposes semantic search, safe action validation, and query generation guided by framework abstractions.",
    features: [
      "Documentation and code indexing focused on engineering assistance",
      "Explicit delegation flow between remote MCP and local agent",
      "Guardrails that block critical executions without confirmation",
    ],
    tags: ["mcp", "developer-tools", "search", "guardrails"],
    docsUrl: "https://github.com/SorPuti/core-framework/tree/main/mcp-server",
    githubUrl: "https://github.com/SorPuti/core-framework/tree/main/mcp-server",
    category: "tool",
    featured: true,
    translations: {
      "pt-BR": {
        tagline: "MCP semântico com guardrails para Strider.",
        description:
          "Servidor MCP que expõe busca semântica, validação segura de ações e geração de queries orientadas pelas abstrações do framework.",
        features: [
          "Indexação de docs e código com foco em assistência de engenharia",
          "Fluxo explícito de delegação entre MCP remoto e agente local",
          "Guardrails para bloquear execuções críticas sem confirmação",
        ],
      },
    },
  },
  {
    slug: "plex-cli",
    name: "Plex CLI",
    tagline: "Unified CLI for compile, check, run, and manifest management.",
    description:
      "The command-line interface for Plex with subcommands for toolchain, project, packages, compilation, static checks, and execution.",
    features: [
      "`project` and `pkg` commands for manifest and dependency lock workflows",
      "Integration with the language checker and runtime",
      "`lsp` subcommand for editor integration",
    ],
    tags: ["cli", "toolchain", "compiler", "lsp", "manifest"],
    docsUrl: "https://github.com/MF07-Language-Programing/plex-lang/tree/main/cli",
    githubUrl: "https://github.com/MF07-Language-Programing/plex-lang/tree/main/cli",
    category: "library",
    featured: true,
    translations: {
      "pt-BR": {
        tagline: "CLI unificada para compile, check, run e gestão de manifesto.",
        description:
          "Interface de linha de comando da linguagem Plex com subcomandos para toolchain, projeto, pacotes, compilação, verificação estática e execução.",
        features: [
          "Comandos `project` e `pkg` para manifesto e lock de dependências",
          "Integração com checker e runtime da linguagem",
          "Subcomando `lsp` para integração com editores",
        ],
      },
    },
  },
  {
    slug: "plex-lsp",
    name: "Plex LSP",
    tagline: "Language Server for the Plex developer experience.",
    description:
      "A dedicated language server with diagnostics, strict_types support, and manifest integration for contextual analysis decisions.",
    features: [
      "Checker integration for static feedback",
      "`Plex.toml` reading for contextual behavior",
      "Foundation for autocomplete and IDE tooling",
    ],
    tags: ["lsp", "editor", "dx", "static-analysis"],
    docsUrl: "https://github.com/MF07-Language-Programing/plex-lang/tree/main/lsp",
    githubUrl: "https://github.com/MF07-Language-Programing/plex-lang/tree/main/lsp",
    category: "experiment",
    featured: true,
    translations: {
      "pt-BR": {
        tagline: "Language Server para a experiência de desenvolvimento em Plex.",
        description:
          "Servidor de linguagem dedicado com diagnósticos, suporte a strict_types e integração com o manifesto Plex para decisões de análise contextual.",
        features: [
          "Integração com checker para feedback estático",
          "Leitura de `Plex.toml` para comportamento contextual",
          "Base para autocomplete e tooling de IDE",
        ],
      },
    },
  },
  {
    slug: "stride-workers-messaging",
    name: "Stride Workers & Messaging",
    tagline: "Asynchronous processing and broker integration in the Strider ecosystem.",
    description:
      "The operational layer of core-framework for background tasks, workers, and integrations with Kafka, Redis, and RabbitMQ.",
    features: [
      "Background workers for non-synchronous workloads",
      "Event-oriented integration with queues and brokers",
      "Plug-and-play settings-based configuration",
    ],
    tags: ["workers", "messaging", "kafka", "redis", "rabbitmq"],
    docsUrl: "https://sorputi.github.io/core-framework/",
    githubUrl: "https://github.com/SorPuti/core-framework",
    category: "library",
    featured: false,
    translations: {
      "pt-BR": {
        tagline: "Processamento assíncrono e integração com brokers no ecossistema Strider.",
        description:
          "Camada operacional do core-framework para tarefas em background, workers e integração com Kafka, Redis e RabbitMQ.",
        features: [
          "Workers em background para cargas não síncronas",
          "Integração orientada a eventos com filas e brokers",
          "Configuração plug-and-play baseada em settings",
        ],
      },
    },
  },
];

function localizeProject(project: Project, locale: Locale): Project {
  const translation = locale === "pt-BR" ? project.translations?.["pt-BR"] : undefined;

  if (!translation) {
    return project;
  }

  return {
    ...project,
    tagline: translation.tagline,
    description: translation.description,
    features: translation.features,
  };
}

export const projects: Project[] = rawProjects.map((project) => localizeProject(project, defaultLocale));

export function getProjects(locale: Locale = defaultLocale): Project[] {
  return rawProjects.map((project) => localizeProject(project, locale));
}

export function getFeaturedProjects(limit = 6, locale: Locale = defaultLocale): Project[] {
  return getProjects(locale).filter((project) => project.featured).slice(0, limit);
}

export function getProjectBySlug(slug: string, locale: Locale = defaultLocale): Project | undefined {
  return getProjects(locale).find((project) => project.slug === slug);
}

export function getAllProjectTags(locale: Locale = defaultLocale): string[] {
  return [...new Set(getProjects(locale).flatMap((project) => project.tags))].sort();
}
