import { BrandMark } from "@/components/brand";
import { SHOWCASE_ITEMS } from "@/lib/showcase";
import HeroReel from "@/components/home/hero-reel";
import ShowcaseGrid from "@/components/home/showcase-grid";
import ToolCategories from "@/components/home/tool-categories";
import Link from "next/link";

const STATS = [
  { value: "18+", label: "AI Models" },
  { value: "33+", label: "Creative Tools" },
  { value: "4", label: "Social Platforms" },
  { value: "HD", label: "Video Quality" },
];

const FEATURES = [
  {
    icon: "M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z",
    title: "Text to Video",
    desc: "Transform any prompt into cinematic videos with Kling, Sora, Veo and more",
  },
  {
    icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z",
    title: "Image Generation",
    desc: "Create stunning images with DALL-E, Flux, Midjourney-style models",
  },
  {
    icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
    title: "Visual Effects",
    desc: "Apply 20+ cinematic effects like neon glow, glitch, retro VHS and more",
  },
  {
    icon: "M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5",
    title: "Face Swap & Avatars",
    desc: "Swap faces, create AI avatars, and build custom characters",
  },
  {
    icon: "M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-2.625 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5",
    title: "Cinema Studio",
    desc: "Multi-shot sequences, timeline editing, and professional video production",
  },
  {
    icon: "M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z",
    title: "Social Sharing",
    desc: "Post directly to Instagram, TikTok, X, and YouTube with one click",
  },
];

export default function Page() {
  const reelItems = [
    ...SHOWCASE_ITEMS.filter((i) => i.mediaType === "video"),
    ...SHOWCASE_ITEMS.filter((i) => i.mediaType === "image").slice(0, 5),
  ];

  const trendingItems = SHOWCASE_ITEMS.slice(0, 12);

  return (
    <main className="min-h-[calc(100vh-64px)]">
      {/* Hero Section with animated gradient */}
      <section className="animated-gradient-bg relative overflow-hidden">
        {/* Decorative blur circles */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />

        <div className="relative flex flex-col items-center justify-center pt-24 pb-12 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-white">Powered by 18+ AI models</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-4">
            <BrandMark />
          </h1>

          <p className="text-xl md:text-2xl text-white/90 text-center max-w-2xl leading-relaxed">
            Create stunning AI videos, images, and effects.
            <br />
            <span className="text-cyan-400 font-semibold">Share everywhere in one click.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <Link
              href="/create"
              className="px-8 py-3.5 rounded-xl bg-brand-gradient text-white font-bold text-lg hover:opacity-90 transition-all glow-btn"
              data-testid="cta-start-creating"
            >
              Start Creating Free
            </Link>
            <Link
              href="/community"
              className="px-8 py-3.5 rounded-xl border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Explore Gallery
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 md:gap-12 mt-12">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold bg-brand-gradient bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-xs md:text-sm text-white/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auto-scrolling hero reel */}
      <section className="py-8 overflow-hidden bg-[#0e0e1a]">
        <HeroReel items={reelItems} />
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Everything you need to <span className="bg-brand-gradient bg-clip-text text-transparent">create</span>
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Professional-grade AI tools, all in one place
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="gradient-border p-5 rounded-xl group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={feat.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Trending Now</h2>
            <p className="text-white/70 mt-1">See what the community is creating</p>
          </div>
          <Link
            href="/community"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors"
          >
            View All &rarr;
          </Link>
        </div>
        <ShowcaseGrid items={trendingItems} />
      </section>

      {/* Tool Categories Section */}
      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">
            Explore <span className="bg-brand-gradient bg-clip-text text-transparent">AI Tools</span>
          </h2>
          <p className="text-white/70 text-lg">Pick a tool and start creating in seconds</p>
        </div>
        <ToolCategories />
      </section>

      {/* CTA Banner */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-brand-gradient opacity-30" />
          <div className="absolute inset-0 bg-[#0e0e1a]/50" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to create something amazing?</h2>
            <p className="text-white/80 text-lg mb-6 max-w-lg mx-auto">
              Join thousands of creators using AI to bring their ideas to life.
            </p>
            <Link
              href="/create"
              className="inline-block px-8 py-3.5 rounded-xl bg-brand-gradient text-white font-bold text-lg hover:opacity-90 transition-all glow-btn"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
