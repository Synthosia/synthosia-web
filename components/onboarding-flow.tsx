"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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

const onboardingSteps = [
  {
    id: "welcome",
    eyebrow: "Welcome to Synthosia",
    title: "Your platform control room is ready.",
    description:
      "One account connects projects, keys, CLI context, and integrations across the entire developer platform.",
    accent: "#f54e00",
  },
  {
    id: "projects",
    eyebrow: "Connected projects",
    title: "Keep repositories and context in sync.",
    description:
      "Link GitHub repos once. Your CLI and cloud sessions share the same project state automatically.",
    accent: "#9fc9a2",
  },
  {
    id: "keys",
    eyebrow: "API & keys",
    title: "Manage credentials in one place.",
    description:
      "Create, rotate, and scope API keys. Use them in the CLI, CI, or cloud integrations with full audit.",
    accent: "#9fbbe0",
  },
  {
    id: "cli",
    eyebrow: "CLI & integrations",
    title: "Local and cloud, unified.",
    description:
      "The same identity works in your terminal, GitHub Actions, and the web dashboard. No context switching.",
    accent: "#c0a8dd",
  },
];

const stepIcons = [
  { icon: "◈", label: "Workspace" },
  { icon: "◉", label: "Projects" },
  { icon: "⬡", label: "Keys" },
  { icon: "⟨⟩", label: "CLI" },
];

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = onboardingSteps.length;

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
    <div className="relative flex min-h-dvh flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 right-0 left-0 z-50 h-1 bg-[#e6e5e0]">
        <motion.div
          className="h-full rounded-r-full"
          style={{ backgroundColor: current.accent }}
          initial={false}
          animate={{ width: `${((step + 1) / total) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <Container className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            initial={{ opacity: 0, y: direction > 0 ? 32 : -32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction < 0 ? 32 : -32 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto w-full max-w-2xl text-center"
          >
            {/* Step icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mx-auto mb-8 grid size-16 place-items-center rounded-2xl"
              style={{ backgroundColor: `${current.accent}33`, border: `1px solid ${current.accent}55` }}
            >
              <span
                 className="font-mono text-2xl"
                 style={{ color: current.accent }}
               >
                {stepIcons[step].icon}
              </span>
            </motion.div>

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="font-mono text-xs uppercase tracking-[0.15em]"
              style={{ color: `rgba(38, 37, 30, 0.55)` }}
            >
              {current.eyebrow}
            </motion.p>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-3 font-display text-[2.5rem] leading-[1.1] tracking-[-0.04em] text-[#26251e] sm:text-[3rem]"
            >
              {current.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mx-auto mt-4 max-w-lg font-serif text-[1.08rem] leading-[1.5]"
              style={{ color: `rgba(38, 37, 30, 0.72)` }}
            >
              {current.description}
            </motion.p>

            {/* Step indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="mt-10 flex items-center justify-center gap-2"
            >
              {onboardingSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > step ? 1 : -1);
                    setStep(i);
                  }}
                  className="cursor-pointer rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 24 : 8,
                    height: 8,
                    backgroundColor:
                      i === step ? current.accent : `rgba(38, 37, 30, 0.15)`,
                  }}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-12 flex w-full max-w-2xl items-center justify-between"
        >
          <button
            onClick={prev}
            disabled={step === 0}
            className="cursor-pointer rounded-lg px-5 py-2.5 font-display text-sm transition-opacity duration-150"
            style={{
              color: `rgba(38, 37, 30, 0.55)`,
              backgroundColor: step === 0 ? "transparent" : `#e6e5e0`,
            }}
          >
            Back
          </button>

          <span className="font-mono text-xs" style={{ color: `rgba(38, 37, 30, 0.4)` }}>
            {step + 1} / {total}
          </span>

          <motion.button
            onClick={next}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer rounded-lg px-6 py-2.5 font-display text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90"
            style={{ backgroundColor: "#26251e" }}
          >
            {step < total - 1 ? "Continue" : "Go to dashboard"}
          </motion.button>
        </motion.div>

        {/* Skip option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-6"
        >
          <button
            onClick={() => {
              markOnboardingCompleted();
              router.push("/account");
            }}
            className="font-display text-xs transition-colors duration-150 hover:text-[#cf2d56]"
            style={{ color: `rgba(38, 37, 30, 0.45)` }}
          >
            Skip onboarding
          </button>
        </motion.div>
      </Container>
    </div>
  );
}
