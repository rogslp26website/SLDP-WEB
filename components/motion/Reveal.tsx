"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section";
  className?: string;
}

export default function Reveal({
  children,
  delay = 0,
  as = "div",
  className,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    if (as === "section") {
      return <section className={className}>{children}</section>;
    }
    return <div className={className}>{children}</div>;
  }

  const motionProps = {
    initial: { opacity: 0, y: 24 } as const,
    whileInView: { opacity: 1, y: 0 } as const,
    viewport: { once: true, margin: "-12%" } as const,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay },
    className,
  };

  if (as === "section") {
    return <motion.section {...motionProps}>{children}</motion.section>;
  }

  return <motion.div {...motionProps}>{children}</motion.div>;
}
