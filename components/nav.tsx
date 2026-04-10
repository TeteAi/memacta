"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { Button } from "@/components/ui/button";
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
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/">
          <BrandMark className="text-xl" />
        </Link>
        <nav className="flex items-center gap-6">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  active
                    ? "text-brand-cyan font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        {session?.user ? (
          <div className="flex items-center gap-3">
            <span>{session.user.credits} credits</span>
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
