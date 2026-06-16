"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ALL_TABS = [
  { href: "/dashboard", label: "Calendar" },
  { href: "/dashboard/facilitators", label: "Facilitators" },
  { href: "/dashboard/notices", label: "Important Info" },
  { href: "/dashboard/invites", label: "Admin Invites" },
  { href: "/dashboard/inquiries", label: "Incoming Inquiries" },
  { href: "/dashboard/schools", label: "Register School" },
  { href: "/dashboard/users", label: "User Management" },
  { href: "/dashboard/resources", label: "Resource Management" },
  { href: "/dashboard/admin-resources", label: "Admin Resources" },
  { href: "/dashboard/media", label: "Media Management" },
];

const FACILITATOR_TAB_HREFS = new Set(["/dashboard", "/dashboard/notices", "/dashboard/resources"]);

export default function DashboardNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const tabs = isAdmin ? ALL_TABS : ALL_TABS.filter((t) => FACILITATOR_TAB_HREFS.has(t.href));

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap gap-1 py-2">
          {tabs.map(({ href, label }) => {
            const isActive = href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? "text-lime-green bg-lime-green/10"
                    : "text-gray-600 hover:text-teal-blue hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
