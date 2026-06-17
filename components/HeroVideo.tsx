"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { heroSlides } from "@/lib/heroCarousel";
import { heroTitle } from "@/lib/homeContent";
import MotionButton from "@/components/motion/MotionButton";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

// TODO: drop hero.mp4 into /public
const ROTATING = ["Leaders", "Servants", "Changemakers", "Visionaries"];

function HeroImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const slide = heroSlides[currentIndex];
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    }, slide.durationMs);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <>
      {heroSlides.map((s, i) => (
        <div
          key={s.src}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out kenburns ${
            i === currentIndex ? "opacity-100 z-0" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={s.src}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority={i === 0}
          />
        </div>
      ))}
    </>
  );
}

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

  const showVideo = !videoFailed && !prefersReducedMotion;

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background media */}
      {showVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/hero.mp4"
          poster={heroSlides[0]?.src ?? "/hero/primary.jpg"}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
        />
      ) : (
        <HeroImageCarousel />
      )}

      {/* Neutral dark scrim */}
      <div className="absolute inset-0 bg-black/55 z-[1]" aria-hidden />

      {/* Content */}
      <div
        className={`absolute inset-0 z-10 flex flex-col justify-center px-6 md:px-12 lg:px-16 max-w-7xl mx-auto ${montserrat.className}`}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg max-w-3xl mb-2 md:mb-4">
          {heroTitle}
        </h1>

        <div className="h-12 md:h-14 overflow-hidden mb-6 md:mb-8">
          <AnimatePresence mode="wait">
            <motion.span
              key={ROTATING[wordIndex]}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="block text-2xl md:text-3xl lg:text-4xl font-semibold text-lime-green"
            >
              {ROTATING[wordIndex]}
            </motion.span>
          </AnimatePresence>
        </div>

        <MotionButton
          href="/register"
          className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold bg-lime-green text-white hover:opacity-90 transition-all duration-300 w-fit"
        >
          Register
        </MotionButton>

        <a
          href="#impact"
          className="absolute bottom-8 left-6 md:left-12 lg:left-16 flex items-center gap-2 text-white/80 text-sm"
          aria-label="Scroll to content"
        >
          Scroll to explore
          <ChevronDown className="animate-bounce-slow" size={20} />
        </a>
      </div>
    </section>
  );
}
