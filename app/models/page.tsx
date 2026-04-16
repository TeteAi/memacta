import ModelCard from "@/components/models/model-card";
import { videoModels, imageModels } from "@/lib/ai/models";

export const metadata = {
  title: "AI Models | memacta",
  description: "Explore all 18 AI video and image generation models available on memacta.",
};

export default function ModelsIndexPage() {
  const videos = videoModels();
  const images = imageModels();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent mb-3">
          AI Models
        </h1>
        <p className="text-white/60 text-lg max-w-2xl">
          Explore every model powering memacta — from cinematic video to photorealistic images. One click to try any model.
        </p>
      </div>

      {/* Video Models */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
          Video Models
          <span className="text-sm font-normal text-white/40">({videos.length})</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((m) => (
            <ModelCard key={m.id} model={m} />
          ))}
        </div>
      </section>

      {/* Image Models */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-400 inline-block" />
          Image Models
          <span className="text-sm font-normal text-white/40">({images.length})</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((m) => (
            <ModelCard key={m.id} model={m} />
          ))}
        </div>
      </section>
    </main>
  );
}
