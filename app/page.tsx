import { SHOWCASE_ITEMS } from "@/lib/showcase";
import HeroReel from "@/components/home/hero-reel";
import ShowcaseGrid from "@/components/home/showcase-grid";
import ToolCategories from "@/components/home/tool-categories";
import Link from "next/link";

/* ─── AI Influencer showcase images (Unsplash, high-quality portraits) ─── */
const AI_INFLUENCERS = [
  {
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    name: "Aria Nova",
    followers: "2.4M",
    niche: "Fashion & Lifestyle",
  },
  {
    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
    name: "Luna Kai",
    followers: "1.8M",
    niche: "Beauty & Wellness",
  },
  {
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
    name: "Maya Sol",
    followers: "3.1M",
    niche: "Travel & Adventure",
  },
  {
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    name: "Kai Atlas",
    followers: "1.2M",
    niche: "Tech & Gaming",
  },
  {
    src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80",
    name: "Zara Neon",
    followers: "890K",
    niche: "Music & Culture",
  },
  {
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
    name: "Elena Voss",
    followers: "1.5M",
    niche: "High Fashion",
  },
];

const STATS = [
  { value: "18+", label: "AI Models", color: "text-purple-400" },
  { value: "33+", label: "Creative Tools", color: "text-pink-400" },
  { value: "4", label: "Social Platforms", color: "text-cyan-400" },
  { value: "HD", label: "Video Quality", color: "text-orange-400" },
];

const FEATURES = [
  {
    icon: "M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z",
    title: "Text to Video",
    desc: "Transform any prompt into cinematic videos with Kling, Sora, Veo and more",
    color: "from-purple-500 to-pink-500",
    href: "/create/video",
  },
  {
    icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z",
    title: "Image Generation",
    desc: "Create stunning images with DALL-E, Flux, Midjourney-style models",
    color: "from-pink-500 to-orange-500",
    href: "/create/image",
  },
  {
    icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
    title: "Visual Effects",
    desc: "Apply 20+ cinematic effects like neon glow, glitch, retro VHS and more",
    color: "from-cyan-500 to-blue-500",
    href: "/effects",
  },
  {
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    title: "AI Influencer",
    desc: "Create your own AI influencer with unique personality, style, and voice",
    color: "from-violet-500 to-fuchsia-500",
    href: "/tools/ai-influencer",
  },
  {
    icon: "M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5",
    title: "Face Swap & Avatars",
    desc: "Swap faces, create AI avatars, and build custom characters",
    color: "from-emerald-500 to-cyan-500",
    href: "/tools/face-swap",
  },
  {
    icon: "M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z",
    title: "Social Sharing",
    desc: "Post directly to Instagram, TikTok, X, and YouTube with one click",
    color: "from-rose-500 to-pink-500",
    href: "/create",
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
      {/* ═══════════════════════════════════════════════════════════
          HERO: AI INFLUENCER FOCUS
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a16]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-fuchsia-600/15 rounded-full blur-[150px]" />
        <div className="absolute top-20 right-1/3 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px]" />

        <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-6">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
              <span className="text-sm text-fuchsia-300 font-medium">The #1 AI Influencer Platform</span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-5">
              <span className="text-white">Create Your Own</span>
              <br />
              <span className="text-brand-gradient">AI Influencer</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-8">
              Design stunning AI characters that post, engage, and grow audiences across
              Instagram, TikTok, X, and YouTube — powered by 18+ AI models.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/tools/ai-influencer"
                className="px-8 py-4 rounded-xl bg-brand-gradient text-white font-bold text-lg hover:opacity-90 transition-all glow-btn shadow-lg shadow-fuchsia-500/20"
                data-testid="cta-start-creating"
              >
                Create Your AI Influencer
              </Link>
              <Link
                href="/community"
                className="px-8 py-4 rounded-xl border border-white/15 text-white font-semibold text-lg hover:bg-white/5 transition-all"
              >
                See Examples
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={`text-xl md:text-3xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── AI Influencer Showcase Cards ─── */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 max-w-4xl mx-auto">
            {AI_INFLUENCERS.map((inf, i) => (
              <Link
                key={inf.name}
                href="/tools/ai-influencer"
                className={`group relative rounded-2xl overflow-hidden border border-white/10 hover:border-fuchsia-500/40 transition-all hover:scale-105 hover:shadow-xl hover:shadow-fuchsia-500/20 ${
                  i === 0 || i === 2 ? "md:-mt-4" : i === 1 || i === 5 ? "md:mt-2" : ""
                }`}
              >
                <div className="aspect-[3/4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={inf.src}
                    alt={inf.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading={i < 3 ? "eager" : "lazy"}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5 md:p-3">
                  <p className="text-white text-xs md:text-sm font-bold truncate">{inf.name}</p>
                  <p className="text-fuchsia-300 text-[10px] md:text-xs font-semibold">{inf.followers} followers</p>
                  <p className="text-white/40 text-[9px] md:text-[10px] mt-0.5 truncate hidden md:block">{inf.niche}</p>
                </div>
                {/* "AI" badge */}
                <div className="absolute top-2 right-2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-fuchsia-500 flex items-center justify-center">
                  <span className="text-[8px] md:text-[9px] font-black text-white">AI</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Social proof line */}
          <p className="text-center text-white/30 text-xs mt-6">
            These AI influencers were created with memacta. Create yours in minutes.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS — 3 steps
          ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Create an AI Influencer in <span className="text-brand-gradient">3 Steps</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Design Your Character",
              desc: "Choose appearance, style, and personality. Upload a reference or generate from scratch.",
              color: "from-fuchsia-500 to-pink-500",
              icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
            },
            {
              step: "2",
              title: "Generate Content",
              desc: "Create photos, videos, reels, and stories. Switch outfits, locations, and poses instantly.",
              color: "from-purple-500 to-violet-500",
              icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
            },
            {
              step: "3",
              title: "Post & Grow",
              desc: "Share directly to Instagram, TikTok, X, and YouTube. Track analytics and engagement.",
              color: "from-cyan-500 to-blue-500",
              icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
            },
          ].map((item) => (
            <div key={item.step} className="relative rounded-2xl bg-[#181828] border border-white/10 p-6 text-center">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br ${item.color} text-white text-xs font-black`}>
                  {item.step}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 mt-2">{item.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── AUTO-SCROLLING REEL ─── */}
      <section className="py-6 overflow-hidden bg-[#0e0e1a]">
        <div className="flex items-center justify-between mb-4 px-6">
          <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Created with memacta</h3>
        </div>
        <HeroReel items={reelItems} />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES GRID
          ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
            Everything you need to{" "}
            <span className="text-brand-gradient">create</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Professional-grade AI tools, all in one place
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feat) => (
            <Link
              key={feat.title}
              href={feat.href}
              className="group rounded-xl bg-[#181828] border border-white/10 hover:border-white/25 p-5 transition-all hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={feat.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{feat.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{feat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── TRENDING ─── */}
      <section className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Trending Now</h2>
            <p className="text-white/50 mt-1">See what the community is creating</p>
          </div>
          <Link
            href="/community"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            View All &rarr;
          </Link>
        </div>
        <ShowcaseGrid items={trendingItems} />
      </section>

      {/* ─── TOOL CATEGORIES ─── */}
      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3 text-white">
            Explore{" "}
            <span className="text-brand-gradient">AI Tools</span>
          </h2>
          <p className="text-white/50 text-lg">Pick a tool and start creating in seconds</p>
        </div>
        <ToolCategories />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA BANNER — AI Influencer focus
          ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/30 via-purple-600/20 to-cyan-500/20" />
          <div className="absolute inset-0 bg-[#0e0e1a]/50 backdrop-blur-sm" />
          <div className="absolute inset-0 border border-white/10 rounded-2xl" />
          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
              Your AI Influencer is Waiting
            </h2>
            <p className="text-white/50 text-lg mb-6 max-w-lg mx-auto">
              Join thousands of creators building the next generation of digital personalities.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/tools/ai-influencer"
                className="inline-block px-8 py-3.5 rounded-xl bg-brand-gradient text-white font-bold text-lg hover:opacity-90 transition-all glow-btn"
              >
                Start Creating Now
              </Link>
              <Link
                href="/pricing"
                className="inline-block px-8 py-3.5 rounded-xl border border-white/15 text-white font-semibold text-lg hover:bg-white/5 transition-all"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
