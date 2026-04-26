"use client";

import { motion } from "motion/react";

const particles = [
  { left: "8%", top: "18%", size: 4, delay: 0 },
  { left: "18%", top: "74%", size: 3, delay: 0.3 },
  { left: "31%", top: "28%", size: 2, delay: 0.6 },
  { left: "42%", top: "62%", size: 5, delay: 0.1 },
  { left: "57%", top: "16%", size: 3, delay: 0.8 },
  { left: "68%", top: "48%", size: 2, delay: 0.4 },
  { left: "79%", top: "27%", size: 4, delay: 1 },
  { left: "89%", top: "78%", size: 3, delay: 0.2 },
  { left: "14%", top: "44%", size: 2, delay: 0.7 },
  { left: "51%", top: "84%", size: 3, delay: 0.5 },
  { left: "73%", top: "9%", size: 2, delay: 0.9 },
  { left: "94%", top: "38%", size: 4, delay: 0.15 },
];

export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="noise-layer" />
      {particles.map((particle, index) => (
        <motion.span
          key={`${particle.left}-${particle.top}`}
          className="animated-particle absolute rounded-full bg-[#8b5cf6] shadow-[0_0_22px_rgba(139,92,246,0.55)]"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.35],
            x: [0, index % 2 === 0 ? 18 : -14, 0],
            y: [0, index % 3 === 0 ? -20 : 16, 0],
          }}
          transition={{
            duration: 6 + (index % 4),
            delay: particle.delay,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeOut",
          }}
        />
      ))}
      <motion.div
        className="absolute left-[58%] top-[12%] h-56 w-56 rounded-full border border-[#7c3aed]/20"
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        className="absolute bottom-[10%] left-[9%] h-36 w-36 rounded-full border border-[#2563eb]/20"
        animate={{ opacity: [0.15, 0.45, 0.15], scale: [1, 1.12, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeOut" }}
      />
    </div>
  );
}
