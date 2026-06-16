"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
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

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [useFrosted, setUseFrosted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFacilitator, setIsFacilitator] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);

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
  }, [user?.id, pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const atTop = scrollY < 20;
      if (pathname !== "/") {
        setUseFrosted(false);
        return;
      }
      const overHero = scrollY < viewportHeight - 1;
      setUseFrosted(overHero && !atTop);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    setMobileOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b shadow-sm transition-all duration-300 ${
        useFrosted
          ? "bg-white/80 backdrop-blur-md border-white/20"
          : "bg-white border-gray-200"
      }`}
    >
      <nav className="w-full flex items-center h-14">
        <div className="hidden md:flex flex-1 min-w-0 items-center pl-4 sm:pl-6">
          <Link
            href="/"
            className="font-normal text-black text-base hover:opacity-90 transition whitespace-nowrap"
          >
            RoG SLDP
          </Link>
        </div>
        <ul className="hidden md:flex items-center justify-center gap-1 shrink-0">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  pathname === href
                    ? "text-lime-green bg-lime-green/10"
                    : "text-gray-700 hover:text-lime-green hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden md:flex flex-1 min-w-0 items-center justify-end gap-2 pr-4 sm:pr-6">
          {user ? (
            <>
              {(isAdmin || isFacilitator) && (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-teal-blue hover:bg-teal-blue/10 transition"
                >
                  Dashboard
                </Link>
              )}
              {isParticipant && (
                <Link
                  href="/portal"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-teal-blue hover:bg-teal-blue/10 transition"
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
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center px-5 py-2 rounded-lg text-sm font-semibold bg-lime-green text-white hover:opacity-90 transition-all duration-300"
            >
              Sign up / Sign in
            </Link>
          )}
        </div>
        <button
          type="button"
          className="md:hidden shrink-0 p-2 text-gray-600 hover:text-teal-blue"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 transition-all duration-300">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="block py-2 font-normal text-black text-base"
          >
            RoG SLDP
          </Link>
          <ul className="flex flex-col gap-1 mt-2">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === href
                      ? "text-lime-green bg-lime-green/10"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="pt-2 mt-2 border-t border-gray-200 space-y-1">
              {user ? (
                <>
                  {(isAdmin || isFacilitator) && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-teal-blue text-center"
                    >
                      Dashboard
                    </Link>
                  )}
                  {isParticipant && (
                    <Link
                      href="/portal"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-teal-blue text-center"
                    >
                      Portal
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="block w-full px-3 py-2 rounded-md text-sm font-semibold bg-lime-green text-white text-center"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-semibold bg-lime-green text-white text-center"
                >
                  Sign up / Sign in
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
