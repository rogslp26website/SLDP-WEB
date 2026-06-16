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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  MapPinIcon,
};

// Vision → 350, Mission → 28, Why → 2030 (4, 8, 105 removed)
const contentRows = [
  { label: "Vision", text: aboutVision, statIndex: 1 },
  { label: "Mission", text: aboutMission, statIndex: 0 },
  { label: "The Why", text: aboutWhy, statIndex: 5 },
];

export default function MissionVisionWithStats() {
  return (
    <section id="impact" className="py-12 md:py-14 px-6 bg-teal-blue-dark text-white animate-fade-in scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Our Impact & Mission
        </h2>

        {/* Alternating rows: Vision/Mission/Why (larger) + stat (square) */}
        <div className="space-y-8 md:space-y-10">
          {contentRows.map((row) => {
            const stat = stats[row.statIndex];
            const Icon = stat ? iconMap[stat.icon] : null;
            return (
              <div
                key={row.label}
                className="grid md:grid-cols-[1fr_auto] gap-6 md:gap-8 items-center md:max-w-4xl md:mx-auto"
              >
                {/* Vision / Mission / Why – text left, stat square right */}
                <div className="min-w-0">
                  <h3 className="text-xl md:text-2xl font-semibold text-lime-green mb-2">
                    {row.label}
                  </h3>
                  <p className="text-lg md:text-xl text-white/95 leading-relaxed">
                    {row.text}
                  </p>
                </div>
                {stat && (
                  <div
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 aspect-square w-full max-w-[160px] md:max-w-[140px] md:w-[140px] md:h-[140px] mx-auto md:mx-0"
                  >
                    {Icon && (
                      <Icon className="w-7 h-7 text-lime-green shrink-0" />
                    )}
                    <span className="font-bold text-xl md:text-2xl text-center">
                      {stat.value}
                    </span>
                    <span className="text-xs text-white/90 text-center leading-tight">
                      {stat.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
