"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/our-team", label: "Our Team" },
  { href: "/register", label: "Register" },
  { href: "/resources", label: "Resources" },
  { href: "/gallery", label: "Gallery" },
  { href: "/sponsor", label: "Sponsor Us" },
  { href: "/contact", label: "Contact Us" },
];

function NavLink({
  href,
  label,
  pathname,
  transparent,
  onClick,
  large = false,
}: {
  href: string;
  label: string;
  pathname: string;
  transparent: boolean;
  onClick?: () => void;
  large?: boolean;
}) {
  const active = pathname === href;
  const base =
    large
      ? "block py-3 text-2xl font-medium text-white"
      : `px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:bg-lime-green after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100 ${
          transparent
            ? active
              ? "text-white bg-white/10"
              : "text-white/90 hover:text-white hover:bg-white/10"
            : active
              ? "text-lime-green bg-lime-green/10 after:scale-x-100"
              : "text-gray-700 hover:text-lime-green hover:bg-gray-50"
        }`;

  return (
    <Link href={href} className={base} onClick={onClick}>
      {label}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overHero, setOverHero] = useState(pathname === "/");
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFacilitator, setIsFacilitator] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);

  const isHome = pathname === "/";
  const transparent = isHome && overHero;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsFacilitator(false);
      setIsParticipant(false);
      return;
    }
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        setIsAdmin(!!data.isAdmin);
        setIsFacilitator(!!data.isFacilitator);
        setIsParticipant(!!data.isParticipant);
      })
      .catch(() => {
        setIsAdmin(false);
        setIsFacilitator(false);
        setIsParticipant(false);
      });
  }, [user, user?.id, pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (pathname !== "/") {
        setOverHero(false);
        return;
      }
      const threshold = window.innerHeight - 80;
      setOverHero(window.scrollY < threshold);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    if (mobileOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, closeMobile]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    setMobileOpen(false);
  }

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 border-b transition-colors duration-300 ${
          transparent
            ? "bg-transparent border-transparent shadow-none"
            : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <nav className="w-full flex items-center h-14 px-4 sm:px-6">
          <div className="flex-1 min-w-0 flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-90 transition shrink-0"
            >
              <Image
                src="/logo.png"
                alt="RoG SLDP logo"
                width={40}
                height={40}
                className="h-9 w-9 object-contain"
                priority
              />
              <span
                className={`font-semibold text-base tracking-tight whitespace-nowrap ${
                  transparent ? "text-white" : "text-black"
                }`}
              >
                RoGSLDP
              </span>
            </Link>
          </div>

          <ul className="hidden md:flex items-center justify-center gap-1 shrink-0">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <NavLink
                  href={href}
                  label={label}
                  pathname={pathname}
                  transparent={transparent}
                />
              </li>
            ))}
          </ul>

          <div className="hidden md:flex flex-1 min-w-0 items-center justify-end gap-2">
            {user && (
              <>
                {(isAdmin || isFacilitator) && (
                  <Link
                    href="/dashboard"
                    className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition ${
                      transparent
                        ? "text-white hover:bg-white/10"
                        : "text-teal-blue hover:bg-teal-blue/10"
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
                {isParticipant && (
                  <Link
                    href="/portal"
                    className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition ${
                      transparent
                        ? "text-white hover:bg-white/10"
                        : "text-teal-blue hover:bg-teal-blue/10"
                    }`}
                  >
                    Portal
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-lg text-sm font-semibold bg-lime-green text-white hover:opacity-90 transition-all duration-300"
                >
                  Sign out
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className={`md:hidden shrink-0 p-2 ${
              transparent ? "text-white hover:text-white/80" : "text-gray-600 hover:text-teal-blue"
            }`}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] bg-teal-blue flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between h-14 px-4 border-b border-white/20">
              <Link
                href="/"
                onClick={closeMobile}
                className="flex items-center gap-2.5 text-white"
              >
                <Image
                  src="/logo.png"
                  alt="RoG SLDP logo"
                  width={36}
                  height={36}
                  className="h-8 w-8 object-contain"
                />
                <span className="font-semibold text-base tracking-tight">RoGSLDP</span>
              </Link>
              <button
                type="button"
                onClick={closeMobile}
                className="p-2 text-white hover:text-white/80"
                aria-label="Close menu"
              >
                <X size={28} />
              </button>
            </div>
            <ul className="flex flex-col gap-2 px-6 py-8 flex-1 overflow-y-auto">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <NavLink
                    href={href}
                    label={label}
                    pathname={pathname}
                    transparent
                    large
                    onClick={closeMobile}
                  />
                </li>
              ))}
            </ul>
            {user && (
              <div className="px-6 pb-8 space-y-3 border-t border-white/20 pt-6">
                {(isAdmin || isFacilitator) && (
                  <Link
                    href="/dashboard"
                    onClick={closeMobile}
                    className="block w-full px-4 py-3 rounded-lg text-center text-white font-medium border border-white/30"
                  >
                    Dashboard
                  </Link>
                )}
                {isParticipant && (
                  <Link
                    href="/portal"
                    onClick={closeMobile}
                    className="block w-full px-4 py-3 rounded-lg text-center text-white font-medium border border-white/30"
                  >
                    Portal
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="block w-full px-4 py-3 rounded-lg text-sm font-semibold bg-lime-green text-white text-center"
                >
                  Sign out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
