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
    <section className="py-16 md:py-20 px-6 bg-white animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {stats.map((stat, index) => {
          const Icon = iconMap[stat.icon];
          const isLeft = index % 2 === 0;
          return (
            <div
              key={stat.label}
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
                    {stat.value}
                  </span>
                  <span className="text-sm text-gray-600 leading-snug mt-1 md:mt-0">
                    {stat.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
