import Link from "next/link";

const TOOL_CATEGORIES = [
  {
    name: "Text to Video",
    description: "Transform text prompts into stunning videos",
    href: "/create?tool=text-to-video",
    thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&q=80",
    badge: "Popular",
  },
  {
    name: "Image Generation",
    description: "Create images from your imagination",
    href: "/create?tool=image-gen",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
    badge: "New",
  },
  {
    name: "Face Swap",
    description: "Swap faces with AI precision",
    href: "/create?tool=face-swap",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    badge: "",
  },
  {
    name: "Visual Effects",
    description: "Add cinematic VFX to any clip",
    href: "/effects",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80",
    badge: "20+ Effects",
  },
  {
    name: "Cinema Studio",
    description: "Professional multi-shot editing suite",
    href: "/studio",
    thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&q=80",
    badge: "Pro",
  },
  {
    name: "AI Avatars",
    description: "Generate unique character avatars",
    href: "/create?tool=avatar",
    thumbnail: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80",
    badge: "",
  },
];

export default function ToolCategories() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      data-testid="tool-categories"
    >
      {TOOL_CATEGORIES.map((cat) => (
        <Link
          key={cat.name}
          href={cat.href}
          className="group relative rounded-xl overflow-hidden bg-[#12121e] border border-white/5 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/10"
          data-testid="tool-category-card"
        >
          <div className="aspect-[16/9] relative">
            <img
              src={cat.thumbnail}
              alt={cat.name}
              className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12121e] via-[#12121e]/40 to-transparent" />
            {cat.badge && (
              <span className="absolute top-3 right-3 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-gradient text-white">
                {cat.badge}
              </span>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-bold text-white">{cat.name}</h3>
              <p className="text-sm text-white/50 mt-0.5">{cat.description}</p>
              <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-white bg-white/10 group-hover:bg-brand-gradient px-3 py-1 rounded-full transition-all">
                Try it &rarr;
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
