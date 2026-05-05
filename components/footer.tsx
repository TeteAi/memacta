import Link from "next/link";
import { BrandMark } from "@/components/brand";

const legalLinks = [
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/ai-likeness", label: "AI Likeness Policy" },
  { href: "/legal/dmca", label: "DMCA / Takedowns" },
  { href: "/cookies", label: "Cookie Policy" },
];

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
            {/* Social links — Discord is live; X/Instagram/TikTok/YouTube
                placeholder anchors removed (linking nowhere is worse than
                not advertising). Re-add as real `<a target="_blank"
                rel="noopener noreferrer">` once the accounts exist. */}
            <div className="flex gap-3 mt-5">
              <a
                href="https://discord.gg/memacta"
                aria-label="Join our Discord"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white/60 hover:bg-white/30 hover:text-white transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              </a>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/legal/privacy" className="text-xs text-white/50 hover:text-white transition-colors">Privacy</Link>
            <span className="text-white/20">|</span>
            <Link href="/legal/terms" className="text-xs text-white/50 hover:text-white transition-colors">Terms</Link>
            <span className="text-white/20">|</span>
            <Link href="/legal/ai-likeness" className="text-xs text-white/50 hover:text-white transition-colors">AI Likeness</Link>
            <span className="text-white/20">|</span>
            <Link href="/legal/dmca" className="text-xs text-white/50 hover:text-white transition-colors">DMCA</Link>
            <span className="text-white/20">|</span>
            <Link href="/cookies" className="text-xs text-white/50 hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>

        {/* 5-Column Feature + Legal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
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

          <div>
            <h3 className="text-sm font-bold text-fuchsia-400 mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
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
