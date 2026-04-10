import { BrandMark } from "@/components/brand";
import { SHOWCASE_ITEMS } from "@/lib/showcase";
import HeroReel from "@/components/home/hero-reel";
import ShowcaseGrid from "@/components/home/showcase-grid";
import ToolCategories from "@/components/home/tool-categories";
import Link from "next/link";

export default function Page() {
  // Pick a diverse mix for the hero reel (all videos + some images)
  const reelItems = [
    ...SHOWCASE_ITEMS.filter((i) => i.mediaType === "video"),
    ...SHOWCASE_ITEMS.filter((i) => i.mediaType === "image").slice(0, 5),
  ];

  // Pick 12 trending showcase items
  const trendingItems = SHOWCASE_ITEMS.slice(0, 12);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-background text-foreground">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center pt-20 pb-8 px-4">
        <h1 className="text-7xl md:text-8xl font-black tracking-tight">
          <BrandMark />
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground text-center max-w-xl">
          Create stunning AI videos, images, and effects
        </p>
        <Link
          href="/create"
          className="mt-6 px-8 py-3 rounded-xl bg-brand-gradient text-white font-semibold text-lg hover:opacity-90 transition-opacity"
          data-testid="cta-start-creating"
        >
          Start Creating
        </Link>
      </section>

      {/* Auto-scrolling hero reel */}
      <section className="pb-12 overflow-hidden">
        <HeroReel items={reelItems} />
      </section>

      {/* Trending Section */}
      <section className="px-8 pb-16 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Trending</h2>
          <Link
            href="/community"
            className="text-sm text-brand-cyan hover:underline"
          >
            View all in Community &rarr;
          </Link>
        </div>
        <ShowcaseGrid items={trendingItems} />
      </section>

      {/* Tool Categories Section */}
      <section className="px-8 pb-20 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Explore Tools</h2>
        </div>
        <ToolCategories />
      </section>
    </main>
  );
}
