import { notFound } from "next/navigation";
import { P2_TOOLS } from "@/lib/tools/p2-tools";
import { P3_TOOLS } from "@/lib/tools/p3-tools";
import { ToolPage } from "@/components/tools/tool-page";
import Link from "next/link";

const ALL_TOOLS = [...P2_TOOLS, ...P3_TOOLS];

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = ALL_TOOLS.find((t) => t.slug === slug);
  if (!tool) notFound();
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Link href="/tools" className="text-white/50 hover:text-white text-sm transition-colors">Tools</Link>
          <span className="text-white/30">/</span>
          <span className="text-sm text-white/70 capitalize">{tool.category}</span>
        </div>
        <h1 className="text-3xl font-bold bg-brand-gradient bg-clip-text text-transparent">{tool.name}</h1>
        <p className="text-white/70 mt-2">{tool.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/15 text-white/70 capitalize font-medium">{tool.category}</span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-medium">Output: {tool.mediaOut}</span>
        </div>
      </div>
      <div className="rounded-2xl bg-[#181828] border border-white/15 p-6">
        <ToolPage tool={tool} />
      </div>
    </main>
  );
}
