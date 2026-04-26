export const locales = ["en", "pt-BR"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeCookieName = "synthosia.locale";
export const localeStorageKey = "synthosia.locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}

export function normalizeLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export const dictionaries = {
  en: {
    language: {
      label: "Language",
      short: "EN",
      name: "English",
      next: "Português",
    },
    theme: {
      toggle: "Toggle theme",
    },
    header: {
      navLabel: "Primary navigation",
      account: "Account",
    },
    footer: {
      brand: "Synthosia Ecosystem",
      description: "Unified platform for learning, building, managing, and extending AI-native systems.",
      navLabel: "Footer links",
    },
    copy: {
      idle: "Copy",
      copied: "Copied",
      error: "Error",
    },
    githubMention: {
      loadError: "Unable to load this GitHub profile right now.",
      profile: "GitHub profile",
      mention: "GitHub mention",
      defaultBio: "Developer connected to this ecosystem.",
      repos: "Repos",
      followers: "Followers",
      following: "Following",
      projects: "GitHub projects",
      related: "Related Synthosia projects",
      repositoryFallback: "Repository without description.",
      code: "Code",
      stars: "stars",
    },
    projectPage: {
      notFound: "Project not found",
      overview: "Project overview",
      features: "Features",
      links: "Links",
      openDocs: "Open docs",
      openGithub: "Open GitHub",
      usage: "Usage",
    },
    docs: {
      onboardingEyebrow: "Documentation onboarding",
      onboardingTitle: "Learn the platform through guided tracks, not a cramped list.",
      onboardingBody:
        "Search by concept, choose a track, and continue through individual pages with their own sidebar, summary, next steps, and configurable widgets.",
      categoryBody: "Track with individual pages, dedicated widgets, and the next step defined automatically.",
      searchLabel: "Search",
      searchPlaceholder: "syntax, api keys, routing, account",
      searchResults: "Search results",
      matches: "matches",
      docsCount: "docs",
      openDoc: "Open doc",
      backToDocs: "Back to docs",
      sidebarBody: "This sidebar only shows the current documentation track.",
      onThisPage: "On this page",
      overview: "Overview",
      widgets: "Widgets",
      resources: "Resources",
      activeWidgetsEmpty: "No active widgets in this doc.",
      nextStep: "Next step",
      backToIndex: "Back to documentation index",
      documentConfig: "Document config",
      pageComposition: "Page composition",
      pageCompositionBody:
        "This page comes from localized JSON. Add, remove, translate, or reorder widgets in the content file without touching the route.",
      widgetReference: "Widget reference",
      widgetReferenceTitle: "Available resources for new docs",
      projectsEyebrow: "Projects",
      linked: "linked",
      details: "Details",
      github: "GitHub",
      openVideo: "Open video",
      widgetTypes: [
        { title: "Code", icon: "<>", body: "Blocks with copy, terminal commands, language examples, and snippets." },
        { title: "Callout", icon: "!", body: "Warnings, important concepts, and architecture notes." },
        { title: "Steps", icon: "01", body: "Guided flows for setup, deploy, integration, and debugging." },
        { title: "Links", icon: "→", body: "Related actions, internal routes, and external resources." },
        { title: "Video", icon: "▶", body: "Slots for walkthroughs, demos, and external embeds." },
      ],
      widgetReferenceItems: [
        { name: "code", fields: "label, value", description: "Commands, snippets, and examples with Copy." },
        { name: "callout", fields: "title, body, tone", description: "Editorial notes with visual emphasis." },
        { name: "steps", fields: "title, items[]", description: "Guided flows and technical onboarding." },
        { name: "links", fields: "title, items[]", description: "Related actions and resources." },
        { name: "video", fields: "title, body, href, duration", description: "Demos, walkthroughs, and external embeds." },
        { name: "githubProfile", fields: "username, role, focus", description: "GitHub profile with avatar, stats, and projects." },
        { name: "projectGrid", fields: "title, projects[]", description: "Local project cards with docs, tags, and GitHub." },
      ],
      categories: {
        "Getting Started": "Getting Started",
        Language: "Language",
        Framework: "Framework",
        CLI: "CLI",
        Integrations: "Integrations",
        "Account & Platform": "Account & Platform",
      },
    },
  },
  "pt-BR": {
    language: {
      label: "Idioma",
      short: "PT",
      name: "Português brasileiro",
      next: "English",
    },
    theme: {
      toggle: "Alternar tema",
    },
    header: {
      navLabel: "Navegação principal",
      account: "Conta",
    },
    footer: {
      brand: "Ecossistema Synthosia",
      description: "Plataforma unificada para aprender, construir, gerenciar e expandir sistemas nativos de IA.",
      navLabel: "Links do rodapé",
    },
    copy: {
      idle: "Copiar",
      copied: "Copiado",
      error: "Erro",
    },
    githubMention: {
      loadError: "Não foi possível carregar esse perfil do GitHub agora.",
      profile: "Perfil no GitHub",
      mention: "Menção do GitHub",
      defaultBio: "Desenvolvedor conectado a este ecossistema.",
      repos: "Repos",
      followers: "Seguidores",
      following: "Seguindo",
      projects: "Projetos no GitHub",
      related: "Projetos Synthosia relacionados",
      repositoryFallback: "Repositório sem descrição.",
      code: "Código",
      stars: "estrelas",
    },
    projectPage: {
      notFound: "Projeto não encontrado",
      overview: "Visão geral do projeto",
      features: "Recursos",
      links: "Links",
      openDocs: "Abrir docs",
      openGithub: "Abrir GitHub",
      usage: "Uso",
    },
    docs: {
      onboardingEyebrow: "Introdução à documentação",
      onboardingTitle: "Aprenda a plataforma por trilhas guiadas, não por uma lista apertada.",
      onboardingBody:
        "Pesquise por conceito, escolha uma trilha e continue por páginas individuais com sidebar própria, sumário, próximos passos e widgets configuráveis.",
      categoryBody: "Trilha com páginas individuais, widgets próprios e próxima etapa definida automaticamente.",
      searchLabel: "Busca",
      searchPlaceholder: "sintaxe, chaves de API, rotas, conta",
      searchResults: "Resultados da busca",
      matches: "resultados",
      docsCount: "docs",
      openDoc: "Abrir doc",
      backToDocs: "Voltar para docs",
      sidebarBody: "Esta sidebar mostra apenas a trilha da documentação atual.",
      onThisPage: "Nesta página",
      overview: "Visão geral",
      widgets: "Widgets",
      resources: "Recursos",
      activeWidgetsEmpty: "Nenhum widget ativo nesta doc.",
      nextStep: "Próxima etapa",
      backToIndex: "Voltar para o índice da documentação",
      documentConfig: "Configuração do documento",
      pageComposition: "Composição da página",
      pageCompositionBody:
        "Esta página vem de JSON localizado. Adicione, remova, traduza ou reordene widgets no arquivo de conteúdo sem tocar na rota.",
      widgetReference: "Referência de widgets",
      widgetReferenceTitle: "Recursos disponíveis para novas docs",
      projectsEyebrow: "Projetos",
      linked: "vinculados",
      details: "Detalhes",
      github: "GitHub",
      openVideo: "Abrir vídeo",
      widgetTypes: [
        { title: "Código", icon: "<>", body: "Blocos com copy, terminal, exemplos de linguagem e comandos." },
        { title: "Destaque", icon: "!", body: "Avisos, conceitos importantes e notas de arquitetura." },
        { title: "Passos", icon: "01", body: "Fluxos guiados para setup, deploy, integração e depuração." },
        { title: "Links", icon: "→", body: "Ações relacionadas, rotas internas e recursos externos." },
        { title: "Vídeo", icon: "▶", body: "Espaços para walkthroughs, demos e embeds externos." },
      ],
      widgetReferenceItems: [
        { name: "code", fields: "label, value", description: "Comandos, snippets e exemplos com Copy." },
        { name: "callout", fields: "title, body, tone", description: "Notas editoriais com ênfase visual." },
        { name: "steps", fields: "title, items[]", description: "Fluxos guiados e onboarding técnico." },
        { name: "links", fields: "title, items[]", description: "Ações e recursos relacionados." },
        { name: "video", fields: "title, body, href, duration", description: "Demos, walkthroughs e embeds externos." },
        { name: "githubProfile", fields: "username, role, focus", description: "Perfil GitHub com avatar, estatísticas e projetos." },
        { name: "projectGrid", fields: "title, projects[]", description: "Cards de projetos locais com docs, tags e GitHub." },
      ],
      categories: {
        "Getting Started": "Primeiros passos",
        Language: "Linguagem",
        Framework: "Framework",
        CLI: "CLI",
        Integrations: "Integrações",
        "Account & Platform": "Conta e plataforma",
      },
    },
  },
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
