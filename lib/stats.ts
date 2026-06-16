// Stats for hero impact section (one box per stat, Hero icon + bold number)
// Icon names match @heroicons/react/24/outline

export interface StatItem {
  value: string | number;
  label: string;
  icon: string; // Heroicon component name
}

export const stats: StatItem[] = [
  { value: 28, label: "Participating Partner Schools", icon: "AcademicCapIcon" },
  { value: 350, label: "Student Leaders in 2025 Cohort", icon: "UserGroupIcon" },
  {
    value: 105,
    label: "Leadership Growth Points (Max Score)",
    icon: "ChartBarIcon",
  },
  {
    value: 4,
    label: "Pillars of Transformation (S.A.L.T.)",
    icon: "Squares2X2Icon",
  },
  { value: 8, label: "Months of Intensive Formation", icon: "CalendarDaysIcon" },
  { value: 2030, label: "Vision for National Impact", icon: "MapPinIcon" },
];
