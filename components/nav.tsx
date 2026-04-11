"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { BrandMark } from "@/components/brand";

const links = [
  { href: "/", label: "Home" },
  { href: "/create", label: "Create" },
  { href: "/effects", label: "Effects" },
  { href: "/studio", label: "Studio" },
  { href: "/chat", label: "Chat" },
  { href: "/library", label: "Library" },
  { href: "/community", label: "Community" },
  { href: "/pricing", label: "Pricing" },
];

export default function Nav({ session = null }: { session?: Session | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a14]/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark className="text-2xl" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="text-sm text-white/70 bg-white/10 px-3 py-1 rounded-full">
                {session.user.credits} credits
              </span>
              <Link
                href="/account"
                className="hidden sm:block px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
              >
                Account
              </Link>
            </>
          ) : (
            <Link
              href="/api/auth/signin"
              className="hidden sm:block px-5 py-2 text-sm font-semibold rounded-lg bg-brand-gradient text-white hover:opacity-90 transition-all glow-btn"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0a14]/95 backdrop-blur-xl">
          <nav className="flex flex-col px-6 py-4 gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-brand-gradient text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-3 pt-3 border-t border-white/10">
              {session?.user ? (
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  Account ({session.user.credits} credits)
                </Link>
              ) : (
                <Link
                  href="/api/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-3 rounded-xl bg-brand-gradient text-white text-sm font-semibold"
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
