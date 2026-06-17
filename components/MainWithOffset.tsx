"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function MainWithOffset({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <main className={`min-h-screen ${isHome ? "" : "pt-14"}`}>{children}</main>
  );
}
