"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/container";

const ONBOARDING_KEY = "synthosia-onboarding-completed";

function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

function markOnboardingCompleted(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_KEY, "true");
}

type OnboardingStep = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  accent: string;
};

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    eyebrow: "Synthosia Cloud",
    title: "Um console único para identidade, infraestrutura e entrega.",
    description:
      "Este fluxo resume como o Synthosia organiza workspaces, permissões, integrações e automações — antes de você abrir o painel principal.",
    bullets: [
      "Identidade unificada entre web, API e CLI",
      "Separação clara entre projeto, ambiente e políticas",
      "Pronto para conectar GitHub, instâncias e edge (Cloudflare)",
    ],
    accent: "#f54e00",
  },
  {
    id: "workspace",
    eyebrow: "Workspace & governança",
    title: "Cada ação acontece dentro de um workspace com papéis explícitos.",
    description:
      "Owners e admins definem quem pode criar chaves, alterar DNS ou registrar hosts. Desenvolvedores operam o dia a dia; viewers acompanham leitura.",
    bullets: [
      "RBAC com papéis owner, admin, developer e viewer",
      "Auditoria de eventos para mudanças sensíveis",
      "Convites e membros centralizados (API em evolução)",
    ],
    accent: "#9fc9a2",
  },
  {
    id: "projects",
    eyebrow: "Projetos & repositórios",
    title: "Projetos amarram repositórios, pipelines e contexto operacional.",
    description:
      "Você pode ligar slugs de projeto, preparar operações Git assíncronas e manter o mesmo estado entre o dashboard e o terminal.",
    bullets: [
      "Slug de projeto imutável por organização",
      "Fila de operações Git (clone / push / sync) para workers",
      "Integração GitHub com escopos mínimos (read:user, user:email)",
    ],
    accent: "#9fbbe0",
  },
  {
    id: "compute",
    eyebrow: "Instâncias & runtime",
    title: "Registre hosts de build, deploy ou runners dedicados.",
    description:
      "As instâncias aparecem no console com host, porta e ambiente. Em produção, agents validam chaves SSH e health antes de aceitar tráfego.",
    bullets: [
      "Metadados JSON por instância para automação",
      "Separação entre produção, staging e desenvolvimento",
      "Pronto para conectar observabilidade e alertas",
    ],
    accent: "#c0a8dd",
  },
  {
    id: "edge",
    eyebrow: "Edge & Cloudflare",
    title: "Redirecionamentos e verificação de domínio com token dedicado.",
    description:
      "Cada redirecionamento gera um token de verificação. Após validar o CNAME, o painel marca o registro como configurado quando as credenciais Cloudflare estão presentes.",
    bullets: [
      "CLOUDFLARE_API_TOKEN e CLOUDFLARE_ZONE_ID no backend",
      "Estados: pendente → configurado → ativo (via workers)",
      "Evita alterações destrutivas sem confirmação humana",
    ],
    accent: "#f0b429",
  },
  {
    id: "keys",
    eyebrow: "API keys & IAM",
    title: "Credenciais com escopos e rotação explícita.",
    description:
      "Chaves são prefixadas, armazenadas como digest e amarradas a permissões declarativas. Sempre há trilha de auditoria quando uma chave é criada ou revogada.",
    bullets: [
      "Scopes declarados por recurso (projects, integrations, git)",
      "Cookies HttpOnly + CSRF para mutações no browser",
      "Camada de serviço pronta para granularidade adicional",
    ],
    accent: "#cf2d56",
  },
  {
    id: "finish",
    eyebrow: "Próximo passo",
    title: "Você está pronto para operar o Synthosia Cloud Console.",
    description:
      "Use o painel para revisar workspace, registrar instâncias, validar DNS e acompanhar filas Git. Em dúvida, volte a este onboarding limpando o progresso no armazenamento local.",
    bullets: [
      "Menu lateral agrupa Overview, Team, Compute, Edge e Access",
      "Mensagens de erro aparecem ao lado da ação correspondente",
      "Integrações podem ser expandidas sem refatorar o core",
    ],
    accent: "#26251e",
  },
];

const stepIcons = ["◈", "◎", "◉", "⬡", "⎈", "⬢", "✓"];

export function OnboardingFlow() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const stepDuration = reduceMotion ? 0.18 : 0.58;
  const stagger = reduceMotion ? 0.04 : 0.12;
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = onboardingSteps.length;

  const progress = useMemo(() => (step + 1) / total, [step, total]);

  useEffect(() => {
    if (hasCompletedOnboarding()) {
      router.push("/account");
    }
  }, [router]);

  const next = useCallback(() => {
    if (step < total - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      markOnboardingCompleted();
      router.push("/account");
    }
  }, [step, total, router]);

  const prev = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  const current = onboardingSteps[step];

  return (
    <div className="relative flex min-h-dvh flex-col bg-[var(--surface-page)]">
      <div className="fixed top-0 right-0 left-0 z-50 h-1 overflow-hidden bg-[#e6e5e0]">
        <motion.div
          className="h-full origin-left rounded-r-full"
          style={{ backgroundColor: current.accent, scaleX: progress }}
          initial={false}
          animate={{ scaleX: progress }}
          transition={{ duration: reduceMotion ? 0.15 : 0.45, ease: "easeOut" }}
        />
      </div>

      <Container className="flex flex-1 flex-col px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="mx-auto grid w-full max-w-6xl flex-1 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              initial={{ opacity: 0, y: direction > 0 ? 28 : -28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction < 0 ? 28 : -28 }}
              transition={{ duration: stepDuration, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: stepDuration, delay: stagger, ease: "easeOut" }}
                className="mx-auto mb-8 grid size-20 place-items-center rounded-3xl lg:mx-0"
                style={{
                  backgroundColor: `${current.accent}2A`,
                  border: `1px solid ${current.accent}66`,
                }}
              >
                <span className="font-mono text-3xl" style={{ color: current.accent }}>
                  {stepIcons[step] ?? "◈"}
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: stepDuration * 0.8, delay: stagger * 1.5 }}
                className="font-mono text-xs uppercase text-secondary"
              >
                {current.eyebrow}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: stepDuration, delay: stagger * 2 }}
                className="mt-4 text-balance font-display text-[2.35rem] leading-[1.08] text-primary sm:text-[2.85rem] lg:text-[3.2rem]"
              >
                {current.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: stepDuration, delay: stagger * 2.8 }}
                className="mx-auto mt-5 max-w-2xl text-pretty font-serif text-[1.12rem] leading-[1.55] text-secondary lg:mx-0 lg:max-w-none"
              >
                {current.description}
              </motion.p>

              <motion.ul
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: stepDuration, delay: stagger * 3.6 }}
                className="mx-auto mt-8 max-w-2xl space-y-3 text-left lg:mx-0"
              >
                {current.bullets.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-[#050509]/40 px-4 py-3 font-serif text-sm leading-snug text-secondary sm:text-[0.95rem]"
                  >
                    <span className="mt-0.5 font-mono text-xs text-[var(--brand-accent,#f54e00)]">▪</span>
                    <span>{item}</span>
                  </li>
                ))}
              </motion.ul>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: stepDuration * 0.85, delay: stagger * 4.4 }}
                className="mt-10 flex items-center justify-center gap-2 lg:justify-start"
              >
                {onboardingSteps.map((_, i) => (
                  <button
                    key={onboardingSteps[i].id}
                    type="button"
                    onClick={() => {
                      setDirection(i > step ? 1 : -1);
                      setStep(i);
                    }}
                    className="cursor-pointer rounded-full transition-opacity duration-150 hover:opacity-90"
                    style={{
                      width: i === step ? 28 : 8,
                      height: 8,
                      backgroundColor: i === step ? current.accent : `rgba(38, 37, 30, 0.15)`,
                    }}
                    aria-label={`Ir para etapa ${i + 1}: ${onboardingSteps[i].eyebrow}`}
                  />
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: stepDuration, delay: reduceMotion ? 0 : 0.2 }}
            className="surface-panel relative overflow-hidden rounded-[28px] p-6 sm:p-8"
            aria-label="Resumo visual do console"
          >
            <p className="relative font-display text-xs uppercase brand-accent">Console preview</p>
            <p className="relative mt-3 font-display text-lg text-primary">Organização em camadas</p>
            <p className="relative mt-2 text-pretty font-serif text-sm leading-relaxed text-secondary">
              O painel `/account` replica a hierarquia de um cloud público: overview, equipe, compute, edge, IAM e
              atividade — sem misturar responsabilidades na mesma superfície.
            </p>
            <dl className="relative mt-8 space-y-4 border-t border-white/10 pt-6 font-mono text-xs text-secondary">
              <div className="flex justify-between gap-4">
                <dt>Etapa atual</dt>
                <dd className="text-primary">
                  {step + 1}/{total}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Foco desta etapa</dt>
                <dd className="max-w-[60%] text-right text-primary">{current.eyebrow}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Redução de movimento</dt>
                <dd className="text-primary">{reduceMotion ? "ligada" : "padrão"}</dd>
              </div>
            </dl>
          </motion.aside>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: stepDuration, delay: reduceMotion ? 0 : 0.25 }}
          className="mx-auto mt-14 flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <button
            type="button"
            onClick={prev}
            disabled={step === 0}
            className="cursor-pointer rounded-xl px-5 py-3 font-display text-sm transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              color: `rgba(38, 37, 30, 0.65)`,
              backgroundColor: step === 0 ? "transparent" : `#e6e5e0`,
            }}
          >
            Voltar
          </button>

          <span className="text-center font-mono text-xs text-muted sm:text-left">
            {step + 1} / {total}
          </span>

          <motion.button
            type="button"
            onClick={next}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer rounded-xl px-7 py-3 font-display text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90"
            style={{ backgroundColor: "#26251e" }}
          >
            {step < total - 1 ? "Continuar" : "Abrir console"}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: stepDuration * 0.8, delay: reduceMotion ? 0 : 0.35 }}
          className="mx-auto mt-6 w-full max-w-6xl text-center sm:text-left"
        >
          <button
            type="button"
            onClick={() => {
              markOnboardingCompleted();
              router.push("/account");
            }}
            className="font-display text-xs text-muted transition-colors duration-150 hover:text-[#cf2d56]"
          >
            Pular onboarding
          </button>
        </motion.div>
      </Container>
    </div>
  );
}
