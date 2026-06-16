export interface HeroSlide {
  src: string;
  durationMs: number;
}

// Primary 20s, rest 10s each
export const heroSlides: HeroSlide[] = [
  { src: "/hero/primary.jpg", durationMs: 20000 },
  { src: "/hero/slide2.jpg", durationMs: 10000 },
  { src: "/hero/slide3.jpg", durationMs: 10000 },
  { src: "/hero/slide4.jpg", durationMs: 10000 },
  { src: "/hero/slide5.jpg", durationMs: 10000 },
  { src: "/hero/slide6.jpg", durationMs: 10000 },
  { src: "/hero/slide7.jpg", durationMs: 10000 },
  { src: "/hero/slide8.jpg", durationMs: 10000 },
  { src: "/hero/slide9.jpg", durationMs: 10000 },
  { src: "/hero/slide10.jpg", durationMs: 10000 },
  { src: "/hero/slide11.jpg", durationMs: 10000 },
].filter((s) => s.src); // optional: filter if some slides missing
