import Link from "next/link";

export const metadata = { title: "memacta – Create" };

const CREATE_OPTIONS = [
  {
    title: "Text to Video",
    desc: "Describe a scene and watch it come to life as a cinematic video. Choose from Kling, Sora, Veo and more.",
    href: "/create/video",
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    gradient: "from-purple-500 to-pink-500",
    badge: "Popular",
    features: ["10 video models", "HD & 4K output", "16:9, 9:16, 1:1"],
  },
  {
    title: "Image to Video",
    desc: "Upload any image and animate it into a stunning video. Add motion, camera movement, and effects.",
    href: "/create/image-to-video",
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125M3.375 19.5c-.621 0-1.125-.504-1.125-1.125m0 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125" />
      </svg>
    ),
    gradient: "from-cyan-500 to-blue-500",
    badge: "New",
    features: ["Upload image or URL", "Add motion prompts", "Camera controls"],
  },
  {
    title: "Image Generation",
    desc: "Generate beautiful images from text prompts. Create portraits, landscapes, art, and product shots.",
    href: "/create/image",
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    ),
    gradient: "from-pink-500 to-orange-500",
    badge: null,
    features: ["8 image models", "Style presets", "Portrait & landscape"],
  },
];

export default function CreatePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-white mb-3">
          What do you want to <span className="text-brand-gradient">create</span>?
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Choose your creation type to get started with the right tools and models
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CREATE_OPTIONS.map((opt) => (
          <Link
            key={opt.title}
            href={opt.href}
            className="group relative rounded-2xl bg-[#181828] border border-white/10 hover:border-white/25 p-6 transition-all hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 flex flex-col"
          >
            {opt.badge && (
              <span className="absolute top-4 right-4 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-gradient text-white">
                {opt.badge}
              </span>
            )}

            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${opt.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
              {opt.icon}
            </div>

            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
              {opt.title}
            </h2>

            <p className="text-sm text-white/60 leading-relaxed mb-5 flex-1">
              {opt.desc}
            </p>

            <div className="space-y-1.5 mb-5">
              {opt.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-white/50">
                  <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {f}
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-white/5">
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r ${opt.gradient} bg-clip-text text-transparent group-hover:opacity-100 opacity-80 transition-opacity`}>
                Start Creating
                <svg className="w-4 h-4 text-white/50 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-center gap-6">
        <Link href="/tools" className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
          </svg>
          Explore 33+ tools
        </Link>
        <Link href="/effects" className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          Browse effects
        </Link>
      </div>
    </main>
  );
}
