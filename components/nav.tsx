"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { BrandMark } from "@/components/brand";
import CreditsDisplay from "@/components/credits-display";

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
          {/* Sidebar toggle button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all lg:hidden"
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
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <div className="hidden sm:block">
                <CreditsDisplay />
              </div>
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
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-brand-gradient text-white hover:opacity-90 transition-all glow-btn"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
