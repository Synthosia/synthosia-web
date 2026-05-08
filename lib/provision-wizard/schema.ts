/**
 * Estado e presets do assistente de provisionamento (frontend).
 *
 * Backend atual (Synthosia Cloud): `POST /v1/infrastructure/instances` com imagem Docker,
 * memória, vCPU e porta interna. Git, Compose multi-serviço e secrets persistentes são
 * camadas preparadas na UI para evolução da API/agente (ver comentários no review step).
 */

export type EnvTier = "production" | "staging" | "development";

export type RegionId = "eu-west" | "us-east" | "sa-east";

export type PlanId = "starter" | "growth" | "scale";

export type PlanBadge = "recommended" | "economical" | "performance";

export type StackTemplateId =
  | "compose"
  | "node"
  | "next"
  | "python"
  | "django"
  | "fastapi"
  | "postgres"
  | "redis"
  | "worker"
  | "fullstack"
  | "blank";

export type TemplateBadge = "official" | "community" | "optimized";

export interface PlanPreset {
  id: PlanId;
  vcpu: number;
  ramGb: number;
  diskGb: number;
  /** Estimativa ilustrativa (USD) — não ligada a billing real. */
  monthlyUsd: number;
  hourlyUsd: number;
  badge?: PlanBadge;
}

export interface StackTemplate {
  id: StackTemplateId;
  dockerImage: string;
  defaultInternalPort: number;
  badge: TemplateBadge;
  /** Comando sugerido para deteção Git (UI apenas). */
  suggestedStart?: string;
}

export interface EnvVarRow {
  id: string;
  key: string;
  value: string;
  secret: boolean;
  required?: boolean;
}

export interface ProvisionWizardState {
  step: number;
  projectName: string;
  envTier: EnvTier;
  region: RegionId;
  instanceName: string;
  planId: PlanId;
  templateId: StackTemplateId;
  gitProvider: "github" | "gitlab" | "bitbucket" | "manual";
  repoUrl: string;
  branch: string;
  detectedStack: string | null;
  envRows: EnvVarRow[];
  internalPort: number;
  domain: string;
  httpsEnabled: boolean;
  autoDeploy: boolean;
  restartPolicy: "unless-stopped" | "always" | "on-failure";
  persistentVolumes: boolean;
  backupsEnabled: boolean;
}

export const PLAN_PRESETS: PlanPreset[] = [
  {
    id: "starter",
    vcpu: 1,
    ramGb: 2,
    diskGb: 20,
    monthlyUsd: 12,
    hourlyUsd: 0.018,
    badge: "economical",
  },
  {
    id: "growth",
    vcpu: 2,
    ramGb: 4,
    diskGb: 40,
    monthlyUsd: 28,
    hourlyUsd: 0.042,
    badge: "recommended",
  },
  {
    id: "scale",
    vcpu: 4,
    ramGb: 8,
    diskGb: 80,
    monthlyUsd: 56,
    hourlyUsd: 0.084,
    badge: "performance",
  },
];

export const STACK_TEMPLATES: StackTemplate[] = [
  {
    id: "compose",
    dockerImage: "docker:cli",
    defaultInternalPort: 80,
    badge: "official",
    suggestedStart: "docker compose up",
  },
  {
    id: "node",
    dockerImage: "node:20-alpine",
    defaultInternalPort: 3000,
    badge: "official",
    suggestedStart: "npm run start",
  },
  {
    id: "next",
    dockerImage: "node:20-alpine",
    defaultInternalPort: 3000,
    badge: "optimized",
    suggestedStart: "pnpm start",
  },
  {
    id: "python",
    dockerImage: "python:3.12-slim",
    defaultInternalPort: 8000,
    badge: "official",
    suggestedStart: "python -m http.server",
  },
  {
    id: "django",
    dockerImage: "python:3.12-slim",
    defaultInternalPort: 8000,
    badge: "community",
    suggestedStart: "gunicorn",
  },
  {
    id: "fastapi",
    dockerImage: "python:3.12-slim",
    defaultInternalPort: 8000,
    badge: "community",
    suggestedStart: "uvicorn",
  },
  {
    id: "postgres",
    dockerImage: "postgres:16-alpine",
    defaultInternalPort: 5432,
    badge: "official",
  },
  {
    id: "redis",
    dockerImage: "redis:7-alpine",
    defaultInternalPort: 6379,
    badge: "official",
  },
  {
    id: "worker",
    dockerImage: "node:20-alpine",
    defaultInternalPort: 8080,
    badge: "community",
    suggestedStart: "node worker.js",
  },
  {
    id: "fullstack",
    dockerImage: "nginx:alpine",
    defaultInternalPort: 80,
    badge: "optimized",
  },
  {
    id: "blank",
    dockerImage: "alpine:3.20",
    defaultInternalPort: 80,
    badge: "community",
  },
];

export const REGIONS: { id: RegionId; labelKey: string }[] = [
  { id: "eu-west", labelKey: "regionEuWest" },
  { id: "us-east", labelKey: "regionUsEast" },
  { id: "sa-east", labelKey: "regionSaEast" },
];

export function planById(id: PlanId): PlanPreset {
  return PLAN_PRESETS.find((p) => p.id === id) ?? PLAN_PRESETS[1]!;
}

export function templateById(id: StackTemplateId): StackTemplate {
  return STACK_TEMPLATES.find((t) => t.id === id) ?? STACK_TEMPLATES[1]!;
}

export function initialWizardState(): ProvisionWizardState {
  return {
    step: 1,
    projectName: "",
    envTier: "production",
    region: "eu-west",
    instanceName: "",
    planId: "growth",
    templateId: "next",
    gitProvider: "github",
    repoUrl: "",
    branch: "main",
    detectedStack: null,
    envRows: [{ id: "row-node-env", key: "NODE_ENV", value: "production", secret: false, required: false }],
    internalPort: 3000,
    domain: "",
    httpsEnabled: true,
    autoDeploy: true,
    restartPolicy: "unless-stopped",
    persistentVolumes: false,
    backupsEnabled: false,
  };
}

export function planToApiResources(plan: PlanPreset): { memoryMb: number; cpuMillicores: number } {
  return {
    memoryMb: Math.max(512, Math.round(plan.ramGb * 1024)),
    cpuMillicores: Math.max(250, Math.round(plan.vcpu * 1000)),
  };
}
