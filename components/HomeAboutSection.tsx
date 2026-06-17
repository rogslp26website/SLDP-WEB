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
      {/* Intro – alternating split layout */}
      <section className="section-fullscreen py-16 md:py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-6">
              {homeIntroTitle}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed text-justify">
              {homeIntro}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/hero/slide2.jpg"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <MissionVisionWithStats />

      <SaltFlipCards />

      {/* Expected Outcomes */}
      <section className="section-fullscreen py-16 md:py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-8">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-6">
              Expected Outcomes for Students
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {expectedOutcomes.map((outcome, i) => (
                <li key={i}>{outcome}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="pt-6">
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
