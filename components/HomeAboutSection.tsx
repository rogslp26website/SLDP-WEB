import Image from "next/image";
import Link from "next/link";
import {
  homeIntroTitle,
  homeIntro,
  expectedOutcomes,
} from "@/lib/homeContent";
import MissionVisionWithStats from "@/components/MissionVisionWithStats";
import SaltFlipCards from "@/components/SaltFlipCards";
import Reveal from "@/components/motion/Reveal";
import MotionButton from "@/components/motion/MotionButton";

export default function HomeAboutSection() {
  return (
    <>
      {/* Intro – original centered layout */}
      <section className="py-16 md:py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-6 text-center">
              {homeIntroTitle}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
              {homeIntro}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Media split – below intro text */}
      <section className="pb-16 md:pb-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <Reveal delay={0.1}>
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-lg max-w-3xl mx-auto">
              <Image
                src="/hero/slide2.jpg"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <MissionVisionWithStats />

      <SaltFlipCards />

      {/* Expected Outcomes */}
      <section className="py-16 md:py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-8">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-6 text-center">
              Expected Outcomes for Students
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              {expectedOutcomes.map((outcome, i) => (
                <li key={i}>{outcome}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="pt-6 text-center">
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
