export const platformConfig = {
  cli: {
    name: "Synthosia CLI",
    command: "syn",
    packageName: "@synthosia/cli",
    installCommand: "npm i -g @synthosia/cli",
  },
  storageKey: "synthosia.account.v1",
} as const;

export const cliSteps = [
  {
    title: "Install the CLI",
    description:
      "Install one short command for creating projects, running checks, linking accounts, and syncing integrations.",
    command: platformConfig.cli.installCommand,
  },
  {
    title: "Create a project",
    description: "Generate a workspace with Plex language modules, Strider API scaffolding, and project metadata.",
    command: `${platformConfig.cli.command} init api --with plex --with strider`,
  },
  {
    title: "Link account",
    description: "Connect local development to your account, keys, GitHub sync, and service integrations.",
    command: `${platformConfig.cli.command} login && ${platformConfig.cli.command} project link`,
  },
];

export const cliCommandExamples = [
  `${platformConfig.cli.command} init`,
  `${platformConfig.cli.command} check`,
  `${platformConfig.cli.command} sync`,
  `${platformConfig.cli.command} keys list`,
];
