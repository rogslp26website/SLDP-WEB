"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { heroTitle } from "@/lib/homeContent";
import MotionButton from "@/components/motion/MotionButton";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const ROTATING = ["Leaders", "Servants", "Changemakers", "Visionaries"];
const HERO_POSTER = "/hero/primary.jpg";

const HERO_STACK_GAP = "gap-7 md:gap-8 lg:gap-9";

const wordSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 22,
  mass: 0.85,
};

export default function HeroVideo() {
  const [videoFailed, setVideoFailed] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {!videoFailed ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/hero.mp4"
          poster={HERO_POSTER}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          onError={() => setVideoFailed(true)}
        />
      ) : (
        <Image
          src={HERO_POSTER}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      )}

      <div className="absolute inset-0 bg-black/55 z-[1]" aria-hidden />

      <div
        className={`absolute inset-0 z-10 flex flex-col justify-center items-start pl-8 md:pl-14 lg:pl-20 xl:pl-28 pr-6 ${montserrat.className}`}
      >
        <div className={`flex flex-col items-start ${HERO_STACK_GAP} max-w-3xl`}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
            {heroTitle}
          </h1>

          <div
            className="relative w-full overflow-hidden h-[2.75rem] md:h-[3.25rem] lg:h-[3.75rem]"
            aria-live="polite"
            aria-atomic="true"
          >
            {prefersReducedMotion ? (
              <span className="block text-3xl md:text-4xl lg:text-5xl font-semibold text-lime-green leading-none">
                {ROTATING[wordIndex]}
              </span>
            ) : (
              <AnimatePresence initial={false}>
                <motion.span
                  key={ROTATING[wordIndex]}
                  initial={{ y: "-110%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "110%", opacity: 0 }}
                  transition={{
                    y: wordSpring,
                    opacity: { duration: 0.2 },
                  }}
                  className="absolute left-0 top-0 block text-3xl md:text-4xl lg:text-5xl font-semibold text-lime-green leading-none"
                >
                  {ROTATING[wordIndex]}
                </motion.span>
              </AnimatePresence>
            )}
          </div>

          <MotionButton
            href="/register"
            growOnly
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold bg-lime-green text-white hover:opacity-90 transition-opacity duration-300"
          >
            Register
          </MotionButton>
        </div>

        <a
          href="#impact"
          className="absolute bottom-8 left-8 md:left-14 lg:left-20 xl:left-28 flex items-center gap-2 text-white/80 text-sm"
          aria-label="Scroll to content"
        >
          Scroll to explore
          <ChevronDown className="animate-bounce-slow" size={20} />
        </a>
      </div>
    </section>
  );
}
