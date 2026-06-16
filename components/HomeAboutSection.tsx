import Link from "next/link";
import {
  homeIntroTitle,
  homeIntro,
  expectedOutcomes,
} from "@/lib/homeContent";
import MissionVisionWithStats from "@/components/MissionVisionWithStats";
import SaltFlipCards from "@/components/SaltFlipCards";

export default function HomeAboutSection() {
  return (
    <>
      {/* Intro – white */}
      <section className="py-16 md:py-20 px-6 bg-white animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-6 text-center">{homeIntroTitle}</h2>
          <p className="text-lg text-gray-700 leading-relaxed text-justify">{homeIntro}</p>
        </div>
      </section>

      {/* Mission & Vision + Stats alternating + photos – ALA-style bold block */}
      <MissionVisionWithStats />

      {/* SALT Framework – flip cards */}
      <SaltFlipCards />

      {/* Expected Outcomes – light tint + CTA */}
      <section className="py-16 md:py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-6">
            Expected Outcomes for Students
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {expectedOutcomes.map((outcome, i) => (
              <li key={i}>{outcome}</li>
            ))}
          </ul>
          <div className="pt-6">
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-lime-green text-white hover:opacity-90 transition-all duration-300"
            >
              Read more on About
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
