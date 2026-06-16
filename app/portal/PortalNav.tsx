"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/portal", label: "Calendar" },
  { href: "/portal/important-info", label: "Important Information" },
];

export default function PortalNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap gap-1 py-2">
          {TABS.map(({ href, label }) => {
            const isActive = href === "/portal" ? pathname === "/portal" : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive ? "text-lime-green bg-lime-green/10" : "text-gray-600 hover:text-teal-blue hover:bg-gray-50"
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
