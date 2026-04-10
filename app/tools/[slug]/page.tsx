import { notFound } from "next/navigation";
import { P2_TOOLS } from "@/lib/tools/p2-tools";
import { P3_TOOLS } from "@/lib/tools/p3-tools";
import { ToolPage } from "@/components/tools/tool-page";

const ALL_TOOLS = [...P2_TOOLS, ...P3_TOOLS];

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = ALL_TOOLS.find((t) => t.slug === slug);
  if (!tool) notFound();
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">{tool.name}</h1>
      <p className="text-white/70">{tool.description}</p>
      <ToolPage tool={tool} />
    </main>
  );
}
