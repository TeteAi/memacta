"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { BrandMark } from "@/components/brand";
import CreditsDisplay from "@/components/credits-display";

const links = [
  { href: "/", label: "Home" },
  { href: "/create", label: "Create" },
  { href: "/effects", label: "Effects" },
  { href: "/studio", label: "Studio" },
  { href: "/copilot", label: "Copilot" },
  { href: "/library", label: "Library" },
  { href: "/community", label: "Community" },
  { href: "/pricing", label: "Pricing" },
];

export default function Nav({
  session = null,
  onToggleSidebar,
  sidebarOpen,
}: {
  session?: Session | null;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0e0e1a]/95 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-full">
        {/* Left: Sidebar toggle + Brand */}
        <div className="flex items-center gap-2">
          {/* Sidebar toggle button — 44×44 to clear the Apple HIG minimum
              tap target. Mis-taps below the previous 36×36 fell through
              to the parent header div, which silently did nothing — the
              #1 mobile complaint surface. */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="w-11 h-11 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all lg:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <BrandMark className="text-2xl" />
          </Link>
        </div>

        {/* Center: Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Auth / Credits */}
        <div className="flex items-center gap-2 sm:gap-3">
          {session?.user ? (
            <>
              <div className="hidden sm:block">
                <CreditsDisplay />
              </div>
              {session.user.name && (
                <Link
                  href={`/u/${encodeURIComponent(
                    (session.user.name ?? "")
                      .toLowerCase()
                      .replace(/[^a-z0-9\s-]/g, "")
                      .replace(/[\s-]+/g, "-")
                      .replace(/^-+|-+$/g, "") || `user-${(session.user as { id?: string }).id?.slice(0, 6) ?? "unknown"}`
                  )}`}
                  className="hidden sm:block px-4 py-2 text-sm font-medium rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  My profile
                </Link>
              )}
              <Link
                href="/account"
                className="hidden sm:block px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
              >
                Account
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                aria-label="Sign out"
                title="Sign out"
                className="px-3 sm:px-4 py-2 text-sm font-medium rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="hidden sm:inline-flex px-4 py-2 text-sm font-medium rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 sm:px-5 py-2 text-sm font-semibold rounded-lg bg-brand-gradient text-white hover:opacity-90 transition-all glow-btn"
              >
                Sign up free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
