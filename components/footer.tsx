import Link from "next/link";
import { BrandMark } from "@/components/brand";

const col1Links = [
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/trust", label: "Trust" },
  { href: "/contact", label: "Contact" },
  { href: "/pricing", label: "Pricing" },
  { href: "/studio", label: "Cinema Studio" },
  { href: "/chat", label: "AI Chat" },
  { href: "/tools/ai-influencer", label: "AI Influencer" },
  { href: "/community", label: "Community" },
  { href: "/pricing/enterprise", label: "Enterprise" },
  { href: "/pricing/team", label: "Team" },
  { href: "/blog", label: "Blog" },
  { href: "/community/contests", label: "Contests" },
  { href: "/apps", label: "Apps" },
  { href: "/prompt-guide", label: "Prompt Guide" },
  { href: "/tools/mixed-media", label: "Mixed Media" },
];

const col2Links = [
  { href: "/create?tool=image-gen", label: "Create Image" },
  { href: "/tools/soul-id", label: "Persona Character" },
  { href: "/tools/draw-to-edit", label: "Draw to Edit" },
  { href: "/tools/edit-image", label: "Edit Image" },
  { href: "/tools/upscale", label: "Image Upscale" },
  { href: "/tools/photodump", label: "Photodump Studio" },
  { href: "/tools/inpaint", label: "Inpaint" },
  { href: "/tools/soul-cast", label: "Soul Cast" },
  { href: "/tools/soul-moodboard", label: "Soul Moodboard" },
  { href: "/tools/outfit-swap", label: "Outfit Swap" },
  { href: "/tools/color-grading", label: "Color Grading" },
  { href: "/tools/expand-image", label: "Expand Image" },
  { href: "/tools/skin-enhancer", label: "Skin Enhancer" },
  { href: "/tools/relight", label: "Relight" },
];

const col3Links = [
  { href: "/create?tool=text-to-video", label: "AI Video" },
  { href: "/create?tool=image-to-video", label: "Image to Video" },
  { href: "/create/video", label: "Create Video" },
  { href: "/tools/lipsync-studio", label: "Lipsync Studio" },
  { href: "/tools/talking-avatar", label: "Talking Avatar" },
  { href: "/tools/draw-to-video", label: "Draw to Video" },
  { href: "/tools/motion-control", label: "Motion Control" },
  { href: "/tools/kling-avatars-2", label: "Kling Avatars 2.0" },
  { href: "/tools/clipcut", label: "ClipCut" },
  { href: "/tools/transitions", label: "Transitions" },
  { href: "/tools/angles-2", label: "Angles 2.0" },
  { href: "/tools/shots", label: "Shots" },
  { href: "/effects", label: "Visual Effects" },
];

const col4Links = [
  { href: "/tools/banana-placement", label: "Banana Placement" },
  { href: "/tools/product-placement", label: "Product Placement" },
  { href: "/tools/edit-image", label: "Edit Image" },
  { href: "/tools/edit-video", label: "Edit Video" },
  { href: "/tools/multi-reference", label: "Multi Reference" },
  { href: "/tools/upscale", label: "Upscale" },
  { href: "/tools/image-bg-remover", label: "BG Remover (Image)" },
  { href: "/tools/video-bg-remover", label: "BG Remover (Video)" },
  { href: "/tools/recast", label: "Recast" },
  { href: "/tools/face-swap", label: "Face Swap" },
  { href: "/tools/video-face-swap", label: "Video Face Swap" },
  { href: "/tools/character-swap-2", label: "Character Swap" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/15 bg-[#0a0a16]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Brand Row */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-10">
          <div>
            <BrandMark className="text-2xl" />
            <p className="mt-3 text-sm text-white/60 max-w-xs">
              Create stunning AI videos, images, and effects with the most powerful creative tools on the web.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white/60 hover:bg-white/30 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white/60 hover:bg-white/30 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white/60 hover:bg-white/30 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.8a8.16 8.16 0 004.77 1.52V6.87a4.84 4.84 0 01-1-.18z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white/60 hover:bg-white/30 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://discord.gg/memacta" aria-label="Join our Discord" className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white/60 hover:bg-white/30 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/privacy" className="text-xs text-white/50 hover:text-white transition-colors">Privacy</Link>
            <span className="text-white/20">|</span>
            <Link href="/terms" className="text-xs text-white/50 hover:text-white transition-colors">Terms</Link>
            <span className="text-white/20">|</span>
            <Link href="/cookies" className="text-xs text-white/50 hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>

        {/* 4-Column Feature Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-bold text-white mb-4">memacta</h3>
            <ul className="space-y-2">
              {col1Links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-cyan-400 mb-4">Image</h3>
            <ul className="space-y-2">
              {col2Links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-pink-400 mb-4">Video</h3>
            <ul className="space-y-2">
              {col3Links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-orange-400 mb-4">Edit</h3>
            <ul className="space-y-2">
              {col4Links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} memacta. All rights reserved.
          </p>
          <p className="text-xs text-white/50">
            Made with AI for creators everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
