import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import StudioEditor from "@/components/studio/studio-editor";
import type { Clip } from "@/components/studio/timeline";

export default async function StudioProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let project: { id: string; name: string; clipsJson: string } | null = null;
  try {
    project = await prisma.project.findUnique({
      where: { id },
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
