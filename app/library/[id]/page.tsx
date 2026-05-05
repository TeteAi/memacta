import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import ShareButton from "@/components/social/share-button";

export const dynamic = "force-dynamic";

export default async function LibraryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    redirect(`/auth/signin?callbackUrl=/library/${encodeURIComponent(id)}`);
  }

  // Ownership-scoped read closes the IDOR. Foreign generations return null →
  // notFound() — a guesser can't tell them apart from non-existent ids.
  const generation = await prisma.generation.findFirst({ where: { id, userId } });
  if (!generation) notFound();

  const mediaUrl = generation.resultUrl ?? generation.imageUrl;

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <Link
        href="/library"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
      >
        &larr; Back to Library
      </Link>

      <div className="rounded-xl border border-border bg-white/5 overflow-hidden">
        <div className="aspect-video bg-white/10 flex items-center justify-center">
          {mediaUrl ? (
            generation.mediaType === "video" ? (
              <video
                src={mediaUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={mediaUrl}
                alt={generation.prompt}
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <p className="text-muted-foreground">No media available</p>
          )}
        </div>

        <div className="p-6 space-y-3">
          <h1 className="text-xl font-bold">Generation Detail</h1>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Prompt</dt>
            <dd>{generation.prompt}</dd>
            <dt className="text-muted-foreground">Model</dt>
            <dd>{generation.model}</dd>
            <dt className="text-muted-foreground">Type</dt>
            <dd>{generation.mediaType}</dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd>{generation.status}</dd>
            <dt className="text-muted-foreground">Created</dt>
            <dd>{generation.createdAt.toISOString().split("T")[0]}</dd>
          </dl>

          {mediaUrl && (
            <div className="mb-4">
              <ShareButton
                mediaUrl={mediaUrl}
                mediaType={generation.mediaType as "image" | "video"}
                caption={generation.prompt}
              />
            </div>
          )}

          <form action="/api/community/posts" method="POST">
            <input type="hidden" name="title" value={generation.prompt.slice(0, 60)} />
            <input type="hidden" name="mediaUrl" value={mediaUrl ?? ""} />
            <input type="hidden" name="mediaType" value={generation.mediaType} />
            <input type="hidden" name="toolUsed" value={generation.model} />
            <button
              type="submit"
              className="mt-4 px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Share to Community
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
