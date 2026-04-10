import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ProjectsPage() {
  let projects: { id: string; name: string; createdAt: Date }[] = [];
  try {
    projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true },
    });
  } catch {
    projects = [];
  }
  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Cinema Studio Projects</h1>
        <Link href="/studio" className="text-sm underline">
          ← New project
        </Link>
      </div>
      {projects.length === 0 ? (
        <p className="text-muted-foreground">No saved projects yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/studio/${p.id}`}
                className="block border border-border rounded-lg p-3 hover:bg-accent"
              >
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(p.createdAt).toLocaleString()}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
