import { notFound } from "next/navigation";
import { MODELS } from "@/lib/ai/models";
import { MODEL_DETAILS } from "@/lib/ai/model-details";
import ModelHero from "@/components/models/model-hero";
import ModelSpecs from "@/components/models/model-specs";
import SamplePrompts from "@/components/models/sample-prompts";
import RelatedModels from "@/components/models/related-models";
import { getModel } from "@/lib/ai/models";

export async function generateStaticParams() {
  return MODELS.map((m) => ({ slug: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = getModel(slug);
  if (!model) return {};
  return {
    title: `${model.name} | memacta`,
    description: MODEL_DETAILS[slug]?.tagline ?? model.description,
  };
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const details = MODEL_DETAILS[slug];

  if (!details) {
    notFound();
  }

  const model = getModel(slug);
  const mediaType = model?.mediaType ?? "video";

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-12">
      {/* Hero */}
      <ModelHero details={details} />

      {/* Strengths */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Strengths</h2>
        <ul className="space-y-2">
          {details.strengths.map((s) => (
            <li key={s} className="flex items-start gap-3 text-white/70 text-sm">
              <span className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-brand-gradient flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* Sample Prompts */}
      <SamplePrompts
        modelId={slug}
        mediaType={mediaType}
        prompts={details.samplePrompts}
      />

      {/* Specs */}
      <ModelSpecs details={details} />

      {/* Related */}
      <RelatedModels relatedIds={details.relatedModelIds} />
    </main>
  );
}
