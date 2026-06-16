"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { heroSlides } from "@/lib/heroCarousel";
import { heroTitle, heroTagline } from "@/lib/homeContent";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export default function HeroCarousel() {
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
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Slides */}
      {heroSlides.map((s, i) => (
        <div
          key={s.src}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
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
          {/* Gradient overlay for text legibility */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30 z-[1]"
            aria-hidden
          />
        </div>
      ))}

      {/* Title and tagline overlay (ALA-style: large headline + subtitle) */}
      <div
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center text-white ${montserrat.className}`}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight drop-shadow-lg max-w-4xl mb-4 md:mb-6">
          {heroTitle}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl font-medium opacity-95 max-w-3xl drop-shadow-md mb-8 md:mb-10">
          {heroTagline}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold bg-lime-green text-white hover:opacity-90 transition-all duration-300"
          >
            Register
          </Link>
        </div>
        <a
          href="#impact"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm animate-bounce"
          aria-label="Scroll to content"
        >
          Scroll to explore
        </a>
      </div>
    </section>
  );
}
