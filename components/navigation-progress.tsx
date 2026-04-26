"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setActive(false), 80);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a");

      if (!link) {
        return;
      }

      const href = link.getAttribute("href");

      if (!href || href.startsWith("#") || href.startsWith("http") || link.target === "_blank") {
        return;
      }

      setActive(true);
      window.setTimeout(() => setActive(false), 900);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className="fixed left-0 top-0 z-50 h-0.5 origin-left bg-violet-400"
          initial={{ scaleX: 0, opacity: 0.7 }}
          animate={{ scaleX: 0.84, opacity: 1 }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{ width: "100%" }}
        />
      ) : null}
    </AnimatePresence>
  );
}
