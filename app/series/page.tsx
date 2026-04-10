import Link from "next/link";

export const metadata = { title: "memacta \u2013 Original Series" };

const SHOWS = [
  {
    id: "1",
    title: "Zephyr",
    poster: "https://placehold.co/400x600/1a1a2e/e94560?text=Zephyr",
    description: "A wind-wielding hero navigates a post-AI world.",
  },
  {
    id: "2",
    title: "Neon Requiem",
    poster: "https://placehold.co/400x600/1a1a2e/00d2ff?text=Neon+Requiem",
    description: "Cyberpunk noir thriller set in Neo-Tokyo 2089.",
  },
  {
    id: "3",
    title: "Dreamwalkers",
    poster: "https://placehold.co/400x600/1a1a2e/ff6b9d?text=Dreamwalkers",
    description: "Scientists explore the boundary between AI dreams and reality.",
  },
];

export default function SeriesPage() {
  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Original Series</h1>
      <p className="text-muted-foreground mb-8">
        First AI streaming platform -- stories created entirely with AI generation tools.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {SHOWS.map((show) => (
          <div
            key={show.id}
            data-testid="series-card"
            className="rounded-xl border border-border bg-white/5 overflow-hidden"
          >
            <div className="aspect-[2/3] bg-white/10">
              <img
                src={show.poster}
                alt={show.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-1">{show.title}</h2>
              <p className="text-muted-foreground text-sm mb-3">
                {show.description}
              </p>
              <Link
                href="#"
                className="px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity inline-block"
              >
                Watch
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
