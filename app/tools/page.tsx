import Link from "next/link";
import { P2_TOOLS, type ToolDef } from "@/lib/tools/p2-tools";
import { P3_TOOLS } from "@/lib/tools/p3-tools";

function ToolGrid({ tools }: { tools: ToolDef[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {tools.map((t) => (
        <Link
          key={t.slug}
          href={`/tools/${t.slug}`}
          data-testid={`tool-card-${t.slug}`}
          className="rounded border border-white/10 p-4 hover:bg-white/5"
        >
          <div className="font-semibold">{t.name}</div>
          <div className="text-sm text-white/60">{t.description}</div>
        </Link>
      ))}
    </div>
  );
}

export default function ToolsIndex() {
  const identity = P2_TOOLS.filter((t) => t.category === "identity");
  const editing = P3_TOOLS.filter((t) => t.category === "editing");
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Tools</h1>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Category: Identity</h2>
        <ToolGrid tools={identity} />
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Category: Editing</h2>
        <ToolGrid tools={editing} />
      </section>
    </main>
  );
}
