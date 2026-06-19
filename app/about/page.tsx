import Link from "next/link";
import {
  aboutVision,
  aboutMission,
  aboutWhy,
  expectedOutcomes,
  programComponents,
  strategicExpansion,
} from "@/lib/homeContent";
import { PageHero, PageSection } from "@/components/PageSection";
import SaltFlipCards from "@/components/SaltFlipCards";
import Reveal from "@/components/motion/Reveal";
import BrandMotif from "@/components/BrandMotif";

export default function AboutPage() {
  return (
    <div>
      <PageHero>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          About the Programme
        </h1>
        <p className="text-lg text-white/90">
          The RoG Student Leadership Development Programme in depth.
        </p>
      </PageHero>

      <PageSection className="bg-teal-blue/5">
        <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-8">
          Our Mission & Vision
        </h2>
        <ul className="space-y-5 text-gray-700 leading-relaxed">
          <li>
            <strong className="text-teal-blue">Vision:</strong> {aboutVision}
          </li>
          <li>
            <strong className="text-teal-blue">Mission:</strong> {aboutMission}
          </li>
          <li>
            <strong className="text-teal-blue">The &quot;Why&quot;:</strong>{" "}
            {aboutWhy}
          </li>
        </ul>
      </PageSection>

      <SaltFlipCards />

      <PageSection className="bg-teal-blue/5" delay={0.1}>
        <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-6">
          Expected Outcomes for Students
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {expectedOutcomes.map((outcome, i) => (
            <li key={i}>{outcome}</li>
          ))}
        </ul>
      </PageSection>

      <PageSection className="bg-brand-motif" delay={0.05}>
        <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-8">
          Programme Components
        </h2>
        <div className="space-y-6">
          {programComponents.map((c) => (
            <div
              key={c.title}
              className="border-l-4 border-lime-green pl-5 py-2"
            >
              <h3 className="font-semibold text-teal-blue mb-2">{c.title}</h3>
              <p className="text-gray-700 leading-relaxed text-justify">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection className="bg-teal-blue/5" delay={0.1}>
        <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-6">
          Strategic Expansion (2025–2030)
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {strategicExpansion.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </PageSection>

      <section className="relative overflow-hidden py-16 px-6 bg-brand-motif">
        <BrandMotif />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Reveal>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-lime-green text-white hover:opacity-90 transition-all duration-300 hover:-translate-y-0.5"
            >
              Back to Home
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
