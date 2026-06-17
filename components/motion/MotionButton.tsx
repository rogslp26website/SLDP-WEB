"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface MotionButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function MotionButton({
  href,
  children,
  className = "",
  onClick,
}: MotionButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    </motion.div>
  );
}
