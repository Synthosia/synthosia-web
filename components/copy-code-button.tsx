"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "@/components/language-provider";

type CopyCodeButtonProps = {
  value: string;
};

export function CopyCodeButton({ value }: CopyCodeButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const { dictionary } = useLanguage();

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("error");
    }

    window.setTimeout(() => setStatus("idle"), 1600);
  }

  return (
    <motion.button
      type="button"
      onClick={copyCode}
      whileTap={{ scale: 0.96 }}
      className="relative min-w-16 cursor-pointer overflow-hidden rounded-md border border-white/10 bg-[#171124] px-2.5 py-1.5 font-display text-xs text-violet-100 transition-colors duration-150 ease-out hover:border-violet-300/35 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status}
          className="block"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          {status === "copied" ? dictionary.copy.copied : status === "error" ? dictionary.copy.error : dictionary.copy.idle}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
