import Reveal from "@/components/motion/Reveal";
import BrandMotif from "@/components/BrandMotif";
import type { ReactNode } from "react";

interface PageSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hero?: boolean;
}

/** Hero-style intro block with generous spacing for inner pages */
export function PageHero({ children, className = "" }: PageSectionProps) {
  return (
    <section
      className={`bg-teal-blue-dark text-white py-20 md:py-28 px-6 ${className}`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <Reveal>{children}</Reveal>
      </div>
    </section>
  );
}

/** Standard content section with Reveal animation */
export function PageSection({
  children,
  className = "",
  delay = 0,
}: PageSectionProps) {
  const hasMotif = className.includes("bg-brand-motif");

  return (
    <section
      className={`py-16 md:py-24 px-6 ${hasMotif ? "relative overflow-hidden" : ""} ${className}`}
    >
      {hasMotif && <BrandMotif />}
      <div className={`max-w-4xl mx-auto ${hasMotif ? "relative z-10" : ""}`}>
        <Reveal delay={delay}>{children}</Reveal>
      </div>
    </section>
  );
}
