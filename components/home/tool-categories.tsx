import Link from "next/link";

const TOOL_CATEGORIES = [
  {
    name: "Text to Video",
    description: "Transform text prompts into stunning videos",
    href: "/create?tool=text-to-video",
    thumbnail:
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&q=80",
  },
  {
    name: "Image Generation",
    description: "Create images from your imagination",
    href: "/create?tool=image-gen",
    thumbnail:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
  },
  {
    name: "Face Swap",
    description: "Swap faces with AI precision",
    href: "/create?tool=face-swap",
    thumbnail:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    name: "Visual Effects",
    description: "Add cinematic VFX to any clip",
    href: "/effects",
    thumbnail:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80",
  },
  {
    name: "Cinema Studio",
    description: "Professional video editing suite",
    href: "/studio",
    thumbnail:
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&q=80",
  },
  {
    name: "AI Avatars",
    description: "Generate unique character avatars",
    href: "/create?tool=avatar",
    thumbnail:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80",
  },
];

export default function ToolCategories() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      data-testid="tool-categories"
    >
      {TOOL_CATEGORIES.map((cat) => (
        <Link
          key={cat.name}
          href={cat.href}
          className="group relative rounded-xl overflow-hidden border border-border bg-white/5 hover:border-brand-pink transition-colors"
          data-testid="tool-category-card"
        >
          <div className="aspect-[16/9] relative">
            <img
              src={cat.thumbnail}
              alt={cat.name}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-bold text-white">{cat.name}</h3>
              <p className="text-sm text-white/60 mt-0.5">
                {cat.description}
              </p>
              <span className="inline-block mt-2 text-xs text-brand-cyan group-hover:underline">
                Try it &rarr;
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
