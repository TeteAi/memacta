import Link from "next/link";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [
    { slug: "welcome-to-memacta" },
    { slug: "ai-video-revolution" },
    { slug: "soul-id-deep-dive" },
  ];
}

const TITLES: Record<string, string> = {
  "welcome-to-memacta": "Welcome to memacta",
  "ai-video-revolution": "The AI Video Revolution",
  "soul-id-deep-dive": "Persona: A Deep Dive",
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = TITLES[slug] ?? "Blog Post";

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <Link
        href="/blog"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
      >
        &larr; Back to Blog
      </Link>
      <article>
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground">
          Coming soon. Full article content will be available shortly.
        </p>
      </article>
    </main>
  );
}
