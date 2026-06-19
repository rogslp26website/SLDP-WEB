"use client";

import {
  aboutVision,
  aboutMission,
  aboutWhy,
} from "@/lib/homeContent";
import { stats } from "@/lib/stats";
import {
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import Reveal from "@/components/motion/Reveal";
import CountUp from "@/components/motion/CountUp";
import BrandMotif from "@/components/BrandMotif";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  MapPinIcon,
};

const contentRows = [
  { label: "Vision", text: aboutVision, statIndex: 1 },
  { label: "Mission", text: aboutMission, statIndex: 0 },
  { label: "The Why", text: aboutWhy, statIndex: 5 },
];

export default function MissionVisionWithStats() {
  return (
    <section
      id="impact"
      className="section-fullscreen relative overflow-hidden py-12 md:py-16 px-6 bg-brand-motif scroll-mt-16"
    >
      <BrandMotif />
      <div className="relative z-10 max-w-6xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-10 text-center text-teal-blue">
            Our Impact & Mission
          </h2>
        </Reveal>

        <div className="space-y-8 md:space-y-10">
          {contentRows.map((row, index) => {
            const stat = stats[row.statIndex];
            const Icon = stat ? iconMap[stat.icon] : null;
            const statValue =
              typeof stat?.value === "number"
                ? stat.value
                : parseInt(String(stat?.value), 10) || 0;

            return (
              <Reveal key={row.label} delay={index * 0.1}>
                <div className="grid md:grid-cols-[1fr_auto] gap-6 md:gap-8 items-center md:max-w-4xl md:mx-auto">
                  <div className="min-w-0 rounded-xl bg-lime-green/10 border border-lime-green/20 px-5 py-5 md:px-6 md:py-6">
                    <h3 className="text-xl md:text-2xl font-semibold text-teal-blue mb-2">
                      {row.label}
                    </h3>
                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                      {row.text}
                    </p>
                  </div>
                  {stat && (
                    <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-teal-blue/10 border border-teal-blue/20 aspect-square w-full max-w-[160px] md:max-w-[140px] md:w-[140px] md:h-[140px] mx-auto md:mx-0">
                      {Icon && (
                        <Icon className="w-7 h-7 text-lime-green shrink-0" />
                      )}
                      <span className="font-bold text-xl md:text-2xl text-teal-blue text-center">
                        <CountUp end={statValue} />
                      </span>
                      <span className="text-xs text-gray-600 text-center leading-tight">
                        {stat.label}
                      </span>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
