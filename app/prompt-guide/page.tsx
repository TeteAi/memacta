export const metadata = { title: "memacta – Prompt Guide" };

const TIPS = [
  { title: "Be Specific", desc: "Instead of 'a dog', try 'a golden retriever puppy playing in autumn leaves, soft sunlight, shallow depth of field'", color: "text-cyan-400" },
  { title: "Set the Style", desc: "Add style keywords like 'cinematic', 'anime', 'photoreal', 'oil painting', '3D render', 'vintage film'", color: "text-pink-400" },
  { title: "Describe Lighting", desc: "Use lighting terms: 'golden hour', 'neon glow', 'dramatic shadows', 'soft studio lighting', 'volumetric fog'", color: "text-purple-400" },
  { title: "Camera Angles", desc: "Specify shots: 'close-up', 'wide angle', 'bird's eye view', 'low angle', 'tracking shot', 'dolly zoom'", color: "text-orange-400" },
  { title: "Add Motion (Video)", desc: "For video: 'slow motion', 'timelapse', 'panning left', 'zooming in', 'orbiting around subject'", color: "text-green-400" },
  { title: "Set the Mood", desc: "Emotional keywords: 'ethereal', 'dramatic', 'peaceful', 'energetic', 'mysterious', 'nostalgic'", color: "text-yellow-400" },
];

const EXAMPLES = [
  { prompt: "A cyberpunk city at night, neon signs reflecting on wet streets, flying cars in the distance, cinematic wide angle, volumetric fog", type: "Video" },
  { prompt: "Portrait of a woman made of flowers, surreal art style, pastel colors, studio lighting, high detail", type: "Image" },
  { prompt: "Astronaut floating in space above Earth, golden hour sunlight, slow rotation, 4K cinematic, lens flare", type: "Video" },
  { prompt: "Cozy cabin interior, fireplace glowing, snow falling outside window, warm color palette, photoreal", type: "Image" },
];

export default function PromptGuidePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-brand-gradient">Prompt Guide</h1>
        <p className="text-white/70 mt-2">Master the art of AI prompting to create stunning visuals</p>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6">Tips for Better Prompts</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {TIPS.map((tip) => (
            <div key={tip.title} className="rounded-xl bg-[#181828] border border-white/15 p-5">
              <h3 className={`font-bold mb-2 ${tip.color}`}>{tip.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-6">Example Prompts</h2>
        <div className="space-y-4">
          {EXAMPLES.map((ex, i) => (
            <div key={i} className="rounded-xl bg-[#181828] border border-white/15 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ex.type === "Video" ? "bg-pink-500/20 text-pink-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                  {ex.type}
                </span>
              </div>
              <p className="text-white/90 text-sm font-mono leading-relaxed">{ex.prompt}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
