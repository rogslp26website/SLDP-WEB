"use client";

import { useState, useEffect } from "react";
import { saltPillars } from "@/lib/homeContent";
import Reveal from "@/components/motion/Reveal";

const MOBILE_FLIP_INTERVAL_SEC = 10;

export default function SaltFlipCards() {
  const [seconds, setSeconds] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isMobile]);

  return (
    <section className="py-16 md:py-20 px-6 bg-surface-textured">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-10 text-center">
            The SALT Framework (Core Pillars)
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {saltPillars.map((p, index) => (
            <SaltFlipCard
              key={p.name}
              name={p.name}
              description={p.description}
              index={index}
              mobileSeconds={isMobile ? seconds : null}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SaltFlipCard({
  name,
  description,
  index,
  mobileSeconds,
}: {
  name: string;
  description: string;
  index: number;
  mobileSeconds: number | null;
}) {
  const [manualFlipped, setManualFlipped] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const autoFlipped =
    mobileSeconds != null &&
    mobileSeconds >= MOBILE_FLIP_INTERVAL_SEC * (index + 1) &&
    (mobileSeconds - MOBILE_FLIP_INTERVAL_SEC * (index + 1)) %
      (MOBILE_FLIP_INTERVAL_SEC * 2) <
      MOBILE_FLIP_INTERVAL_SEC;

  const flipped =
    isMobile && mobileSeconds != null
      ? manualFlipped ?? autoFlipped
      : manualFlipped ?? false;

  return (
    <div
      className="h-[200px] md:h-[240px] perspective-1000 cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={() => {
        if (isMobile) setManualFlipped((f) => (f === null ? !autoFlipped : !f));
      }}
      onMouseEnter={() => !isMobile && setManualFlipped(true)}
      onMouseLeave={() => !isMobile && setManualFlipped(false)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500 preserve-3d"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 rounded-xl bg-teal-blue flex items-center justify-center p-6 shadow-lg border border-teal-blue/20"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <h3 className="text-xl font-bold text-white text-center">{name}</h3>
        </div>
        <div
          className="absolute inset-0 rounded-xl bg-teal-blue-dark flex items-center justify-center p-6 shadow-lg border border-white/20"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p className="text-sm text-white/95 text-center leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
