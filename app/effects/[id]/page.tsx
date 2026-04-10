import { notFound } from "next/navigation";
import { getEffectById } from "@/lib/effects";
import { ToolPage } from "@/components/tools/tool-page";
import type { ToolDef } from "@/lib/tools/p2-tools";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const effect = getEffectById(id);
  if (!effect) notFound();

  const tool: ToolDef = {
    id: effect.id,
    slug: effect.id,
    name: effect.name,
    description: effect.prompt,
    category: "editing",
    inputs: [
      { key: "image", label: "Source image URL", type: "image" },
      { key: "prompt", label: "Additional prompt", type: "prompt" },
    ],
    mediaOut: "video",
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">{effect.name}</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={effect.thumbnail} alt={effect.name} className="w-48 rounded border border-white/10" />
      <p className="text-white/70">{effect.prompt}</p>
      <ToolPage tool={tool} />
    </main>
  );
}
