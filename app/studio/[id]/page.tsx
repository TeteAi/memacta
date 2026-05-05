import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import StudioEditor from "@/components/studio/studio-editor";
import type { Clip } from "@/components/studio/timeline";

export const dynamic = "force-dynamic";

export default async function StudioProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    redirect(`/auth/signin?callbackUrl=/studio/${encodeURIComponent(id)}`);
  }

  let project: { id: string; name: string; clipsJson: string } | null = null;
  try {
    // findFirst with userId in the where closes the IDOR — even if a foreign
    // project id is guessed, ownership mismatch returns null → notFound().
    project = await prisma.project.findFirst({
      where: { id, userId },
      select: { id: true, name: true, clipsJson: true },
    });
  } catch {
    project = null;
  }
  if (!project) return notFound();
  let clips: Clip[] = [];
  try {
    const parsed = JSON.parse(project.clipsJson);
    if (Array.isArray(parsed)) clips = parsed as Clip[];
  } catch {
    clips = [];
  }
  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Cinema Studio</h1>
        <Link href="/studio/projects" className="text-sm underline">
          ← All projects
        </Link>
      </div>
      <StudioEditor projectId={project.id} initialName={project.name} initialClips={clips} />
    </main>
  );
}
