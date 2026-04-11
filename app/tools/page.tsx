import Link from "next/link";
import { P2_TOOLS, type ToolDef } from "@/lib/tools/p2-tools";
import { P3_TOOLS } from "@/lib/tools/p3-tools";

function ToolGrid({ tools }: { tools: ToolDef[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {tools.map((t) => (
        <Link
          key={t.slug}
          href={`/tools/${t.slug}`}
          data-testid={`tool-card-${t.slug}`}
          className="rounded-xl border border-white/10 bg-[#181828] p-5 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all group"
        >
          <div className="font-semibold text-white group-hover:text-purple-300 transition-colors">{t.name}</div>
          <div className="text-sm text-white/70 mt-1">{t.description}</div>
          <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-white/60 group-hover:text-white/80 transition-colors">
            Try it
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function ToolsIndex() {
  const identity = P2_TOOLS.filter((t) => t.category === "identity");
  const editing = P3_TOOLS.filter((t) => t.category === "editing");
  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-brand-gradient">Tools</h1>
        <p className="text-white/70 mt-2">Powerful AI tools for every creative need</p>
      </div>

      <section className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 rounded-full bg-brand-gradient" />
          <h2 className="text-xl font-bold text-white">Identity</h2>
        </div>
        <ToolGrid tools={identity} />
      </section>

      <section className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 rounded-full bg-brand-gradient" />
          <h2 className="text-xl font-bold text-white">Editing</h2>
        </div>
        <ToolGrid tools={editing} />
      </section>
    </main>
  );
}
