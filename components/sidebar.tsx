"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

type SidebarSection = {
  title: string;
  icon: React.ReactNode;
  items: SidebarItem[];
  defaultOpen?: boolean;
};

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: "Create",
    defaultOpen: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    items: [
      { label: "Text to Video", href: "/create?tool=text-to-video" },
      { label: "Image to Video", href: "/create?tool=image-to-video" },
      { label: "Image Generation", href: "/create?tool=image-gen" },
    ],
  },
  {
    title: "Identity",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    items: [
      { label: "Soul ID", href: "/tools/soul-id" },
      { label: "Soul Moodboard", href: "/tools/soul-moodboard" },
      { label: "Soul Cast", href: "/tools/soul-cast" },
      { label: "Character Swap 2", href: "/tools/character-swap-2" },
      { label: "Face Swap", href: "/tools/face-swap" },
      { label: "Video Face Swap", href: "/tools/video-face-swap" },
      { label: "Outfit Swap", href: "/tools/outfit-swap" },
      { label: "AI Influencer", href: "/tools/ai-influencer" },
      { label: "Photodump", href: "/tools/photodump" },
    ],
  },
  {
    title: "Editing",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
      </svg>
    ),
    items: [
      { label: "Edit Image", href: "/tools/edit-image" },
      { label: "Edit Video", href: "/tools/edit-video" },
      { label: "Draw to Edit", href: "/tools/draw-to-edit" },
      { label: "Draw to Video", href: "/tools/draw-to-video" },
      { label: "Inpaint", href: "/tools/inpaint" },
      { label: "Expand Image", href: "/tools/expand-image" },
      { label: "Upscale", href: "/tools/upscale" },
      { label: "Color Grading", href: "/tools/color-grading" },
      { label: "Relight", href: "/tools/relight" },
      { label: "Skin Enhancer", href: "/tools/skin-enhancer" },
      { label: "BG Remover (Image)", href: "/tools/image-bg-remover" },
      { label: "BG Remover (Video)", href: "/tools/video-bg-remover" },
    ],
  },
  {
    title: "Video Tools",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    items: [
      { label: "Lipsync Studio", href: "/tools/lipsync-studio" },
      { label: "Talking Avatar", href: "/tools/talking-avatar" },
      { label: "Kling Avatars 2.0", href: "/tools/kling-avatars-2" },
      { label: "Motion Control", href: "/tools/motion-control" },
      { label: "ClipCut", href: "/tools/clipcut" },
      { label: "Transitions", href: "/tools/transitions" },
      { label: "Angles 2.0", href: "/tools/angles-2" },
      { label: "Shots", href: "/tools/shots" },
    ],
  },
  {
    title: "Advanced",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    items: [
      { label: "Multi Reference", href: "/tools/multi-reference" },
      { label: "Recast", href: "/tools/recast" },
      { label: "Product Placement", href: "/tools/product-placement" },
      { label: "Banana Placement", href: "/tools/banana-placement" },
    ],
  },
  {
    title: "Effects & Templates",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    items: [
      { label: "All Effects", href: "/effects" },
      { label: "On Fire", href: "/effects/on-fire" },
      { label: "Neon Glow", href: "/effects/neon-glow" },
      { label: "Crystal Shatter", href: "/effects/crystal-shatter" },
      { label: "Liquid Metal", href: "/effects/liquid-metal" },
      { label: "Lightning Strike", href: "/effects/lightning-strike" },
      { label: "Bullet Time", href: "/effects/bullet-time" },
      { label: "Skibidi", href: "/effects/skibidi" },
      { label: "Mukbang", href: "/effects/mukbang" },
      { label: "View All 20+", href: "/effects" },
    ],
  },
  {
    title: "Studio",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5" />
      </svg>
    ),
    items: [
      { label: "Cinema Studio", href: "/studio" },
      { label: "Saved Projects", href: "/studio/projects" },
    ],
  },
];

const QUICK_LINKS: SidebarItem[] = [
  {
    label: "Home",
    href: "/",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    label: "AI Chat",
    href: "/chat",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    label: "My Library",
    href: "/library",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    ),
  },
  {
    label: "Community",
    href: "/community",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    label: "Pricing",
    href: "/pricing",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
];

function SectionDropdown({ section, pathname }: { section: SidebarSection; pathname: string }) {
  const hasActiveChild = section.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href.split("?")[0] + "/")
  );
  const [open, setOpen] = useState(section.defaultOpen || hasActiveChild);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
          hasActiveChild
            ? "text-white bg-white/5"
            : "text-white/60 hover:text-white hover:bg-white/5"
        }`}
      >
        <span className={`flex-shrink-0 ${hasActiveChild ? "text-purple-400" : "text-white/40 group-hover:text-white/60"}`}>
          {section.icon}
        </span>
        <span className="flex-1 text-left">{section.title}</span>
        <span className="text-white/30">
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="mt-0.5 ml-4 pl-3 border-l border-white/5 space-y-0.5">
          {section.items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={`block px-3 py-1.5 rounded-md text-[13px] transition-all ${
                  active
                    ? "text-white bg-brand-gradient font-medium"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-[#0c0c18] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 sidebar-scroll">
          {/* Quick links */}
          <div className="mb-3">
            {QUICK_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-brand-gradient text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className={active ? "text-white" : "text-white/40"}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="px-3 py-2">
            <div className="border-t border-white/5" />
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mt-3 mb-1 px-1">
              Tools & Features
            </p>
          </div>

          {/* Dropdown sections */}
          {SIDEBAR_SECTIONS.map((section) => (
            <SectionDropdown key={section.title} section={section} pathname={pathname} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="p-3 border-t border-white/5">
          <Link
            href="/create"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold hover:opacity-90 transition-all glow-btn"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Start Creating
          </Link>
        </div>
      </aside>
    </>
  );
}
