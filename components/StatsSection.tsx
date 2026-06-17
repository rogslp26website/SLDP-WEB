"use client";

import {
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { stats } from "@/lib/stats";
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

export default function StatsSection() {
  return (
    <section className="section-fullscreen relative overflow-hidden py-16 md:py-20 px-6 bg-brand-motif">
      <BrandMotif />
      <div className="relative z-10 max-w-6xl mx-auto space-y-6 md:space-y-8">
        {stats.map((stat, index) => {
          const Icon = iconMap[stat.icon];
          const isLeft = index % 2 === 0;
          const statValue =
            typeof stat.value === "number"
              ? stat.value
              : parseInt(String(stat.value), 10) || 0;

          return (
            <Reveal key={stat.label} delay={index * 0.08}>
              <div
                className={`flex flex-col md:flex-row md:items-center md:gap-8 ${
                  isLeft ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div
                  className={`bg-gray-50 rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-teal-blue/30 transition-all duration-300 p-6 flex flex-col md:flex-row md:items-center md:gap-6 md:max-w-xl ${
                    isLeft ? "md:mr-auto" : "md:ml-auto"
                  }`}
                >
                  {Icon && (
                    <Icon className="w-10 h-10 text-teal-blue shrink-0 mb-3 md:mb-0" />
                  )}
                  <div className="flex flex-col md:flex-row md:items-baseline md:gap-3">
                    <span className="font-bold text-2xl md:text-3xl text-teal-blue">
                      <CountUp end={statValue} />
                    </span>
                    <span className="text-sm text-gray-600 leading-snug mt-1 md:mt-0">
                      {stat.label}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
