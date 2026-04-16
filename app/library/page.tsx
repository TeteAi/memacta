import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { SHOWCASE_ITEMS } from "@/lib/showcase";
import LibraryTabs, { type LibraryItem } from "@/components/library/library-tabs";
import Link from "next/link";

export const metadata = { title: "memacta \u2013 Library" };
export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  // When signed out we used to fall through to `where: undefined`, which
  // returned every Generation row in the DB to the anonymous visitor —
  // effectively exposing every user's library. Now: signed out → empty
  // result, so the page shows the signin/"Start Creating" CTA instead
  // of other people's work.
  const [generations, characters, projects] = userId
    ? await Promise.all([
        prisma.generation.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        }),
        prisma.character.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        }),
        prisma.project.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], [], []] as const;

  const items: LibraryItem[] = [
    ...generations.map((g) => ({
      id: g.id,
      type: g.mediaType as "image" | "video",
      title: g.prompt.slice(0, 60),
      thumbnail: g.resultUrl ?? g.imageUrl,
      date: g.createdAt.toISOString().split("T")[0],
    })),
    ...characters.map((c) => ({
      id: c.id,
      type: "character" as const,
      title: c.name,
      thumbnail: c.refImageUrls.split(",")[0] || null,
      date: c.createdAt.toISOString().split("T")[0],
    })),
    ...projects.map((p) => ({
      id: p.id,
      type: "project" as const,
      title: p.name,
      thumbnail: null,
      date: p.createdAt.toISOString().split("T")[0],
    })),
  ];

  const hasContent = items.length > 0;
  const showcasePreview = SHOWCASE_ITEMS.slice(0, 6);

  return (
    <main className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Library</h1>
          <p className="text-white/60 text-sm mt-1">All your creations in one place</p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium px-4 py-2 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>

      {hasContent ? (
        <LibraryTabs items={items} />
      ) : (
        <div className="text-center py-20 rounded-2xl bg-[#181828] border border-white/10" data-testid="library-empty-state">
          <div className="w-16 h-16 mx-auto rounded-xl bg-white/10 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Your creations will appear here</h2>
          <p className="text-white/60 mb-10 max-w-sm mx-auto">
            Generate your first image or video to get started. It only takes a few seconds!
          </p>

          <div className="mb-10">
            <h3 className="text-sm font-medium text-white/50 mb-4">
              See what others are creating
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 max-w-4xl mx-auto px-6">
              {showcasePreview.map((item) => (
                <div
                  key={item.id}
                  className="aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/40 transition-all hover:scale-105 cursor-pointer"
                >
                  {item.mediaType === "video" ? (
                    <video
                      src={item.mediaUrl}
                      poster={item.thumbnailUrl}
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/create"
            className="inline-block px-8 py-3 rounded-xl bg-brand-gradient text-white font-bold hover:opacity-90 transition-all glow-btn"
          >
            Start Creating
          </Link>
        </div>
      )}
    </main>
  );
}
