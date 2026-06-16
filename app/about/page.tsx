import Link from "next/link";
import {
  aboutVision,
  aboutMission,
  aboutWhy,
  saltPillars,
  expectedOutcomes,
  programComponents,
  strategicExpansion,
} from "@/lib/homeContent";

export default function AboutPage() {
  return (
    <div>
      {/* Hero-style header */}
      <section className="bg-teal-blue-dark text-white py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            About the Programme
          </h1>
          <p className="text-lg text-white/90">
            The RoG Student Leadership Development Programme in depth.
          </p>
        </div>
      </section>

      {/* Mission & Vision – light teal */}
      <section className="py-16 md:py-20 px-6 bg-teal-blue/5">
        <div className="max-w-4xl mx-auto">
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
        </div>
      </section>

      {/* SALT Framework – white, cards like homepage */}
      <section className="py-16 md:py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-8">
            The SALT Framework (Core Pillars)
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {saltPillars.map((p) => (
              <div
                key={p.name}
                className="border border-teal-blue/20 rounded-lg p-5 bg-teal-blue/5"
              >
                <h3 className="font-semibold text-lime-green mb-2">{p.name}</h3>
                <p className="text-sm text-gray-700">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expected Outcomes – light teal */}
      <section className="py-16 md:py-20 px-6 bg-teal-blue/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-6">
            Expected Outcomes for Students
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {expectedOutcomes.map((outcome, i) => (
              <li key={i}>{outcome}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Programme Components – white */}
      <section className="py-16 md:py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
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
                <p className="text-gray-700 leading-relaxed text-justify">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Expansion – teal tint */}
      <section className="py-16 md:py-20 px-6 bg-teal-blue/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-6">
            Strategic Expansion (2025–2030)
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {strategicExpansion.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-lime-green text-white hover:opacity-90 transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
