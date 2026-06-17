"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle African-inspired geometric motif that layers BEHIND content and
 * ON TOP of the existing white + dot background (.bg-brand-motif).
 * Includes a gentle scroll parallax so the motif feels decoupled from scroll.
 *
 * Usage: place inside any relatively-positioned section.
 *   <section className="relative py-16 md:py-24 px-6 bg-brand-motif overflow-hidden">
 *     <BrandMotif />
 *     <div className="relative z-10"> ...your content... </div>
 *   </section>
 */
export default function BrandMotif({
  opacity = 0.12,
  speed = 0.15,
}: {
  opacity?: number;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const offset = rect.top - window.innerHeight / 2;
      const y = -offset * speed;
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="brand-motif-layer pointer-events-none absolute inset-0 z-0"
      style={{ opacity }}
    />
  );
}
