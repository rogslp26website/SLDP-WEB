import Image from "next/image";
import {
  homeIntroTitle,
  homeIntro,
  expectedOutcomes,
} from "@/lib/homeContent";
import MissionVisionWithStats from "@/components/MissionVisionWithStats";
import SaltFlipCards from "@/components/SaltFlipCards";
import Reveal from "@/components/motion/Reveal";
import MotionButton from "@/components/motion/MotionButton";

function ContentPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-teal-blue-dark border border-white/20 shadow-2xl px-6 py-8 md:px-10 md:py-10 ${className}`}
    >
      {children}
    </div>
  );
}

export default function HomeAboutSection() {
  return (
    <>
      {/* Nurturing ? primary hero image as background, text in teal panel */}
      <section className="relative py-16 md:py-24 px-6 overflow-hidden">
        <Image
          src="/hero/primary.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden />

        <div className="relative z-10 max-w-4xl mx-auto">
          <Reveal>
            <ContentPanel>
              <h2 className="text-2xl md:text-3xl font-bold text-lime-green mb-6 text-center">
                {homeIntroTitle}
              </h2>
              <p className="text-lg text-white leading-relaxed text-center max-w-3xl mx-auto">
                {homeIntro}
              </p>
            </ContentPanel>
          </Reveal>
        </div>
      </section>

      <MissionVisionWithStats />
      <SaltFlipCards />

      {/* Expected Outcomes ? different background, text in teal panel */}
      <section className="relative py-16 md:py-24 px-6 overflow-hidden">
        <Image
          src="/hero/slide5.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/55" aria-hidden />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <Reveal>
            <ContentPanel>
              <h2 className="text-2xl md:text-3xl font-bold text-lime-green mb-6 text-center">
                Expected Outcomes for Students
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white leading-relaxed">
                {expectedOutcomes.map((outcome, i) => (
                  <li key={i}>{outcome}</li>
                ))}
              </ul>
            </ContentPanel>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="text-center">
              <MotionButton
                href="/about"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-lime-green text-white hover:opacity-90 transition-all duration-300"
              >
                Read more on About
              </MotionButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
