import Link from "next/link";

export const metadata = { title: "memacta \u2013 Blog" };

const POSTS = [
  {
    slug: "welcome-to-memacta",
    title: "Welcome to memacta",
    excerpt:
      "Introducing memacta -- the all-in-one AI creation platform for video, image, and character generation.",
    date: "2026-04-01",
  },
  {
    slug: "ai-video-revolution",
    title: "The AI Video Revolution",
    excerpt:
      "How AI-powered video generation is changing the creative landscape for filmmakers and content creators.",
    date: "2026-03-25",
  },
  {
    slug: "soul-id-deep-dive",
    title: "Soul ID: A Deep Dive",
    excerpt:
      "Learn how Soul ID lets you create persistent AI characters that maintain identity across generations.",
    date: "2026-03-18",
  },
];

export default function BlogPage() {
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <div className="space-y-4">
        {POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-xl border border-border bg-white/5 p-6 hover:border-brand-pink transition-colors"
            data-testid="blog-card"
          >
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-muted-foreground text-sm mb-3">{post.excerpt}</p>
            <span className="text-xs text-muted-foreground">{post.date}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
