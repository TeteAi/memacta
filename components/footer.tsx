import Link from "next/link";
import { BrandMark } from "@/components/brand";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/trust", label: "Trust" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/60 py-8 mt-16">
      <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <BrandMark className="text-lg" />
        <nav className="flex flex-wrap items-center gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} memacta. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
