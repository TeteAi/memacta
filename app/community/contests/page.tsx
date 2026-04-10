import Link from "next/link";

export const metadata = { title: "memacta \u2013 Creative Challenges" };

const CONTESTS = [
  {
    id: "1",
    title: "Neon Dreams Challenge",
    description:
      "Create a cyberpunk-themed video or image using neon lighting and futuristic cityscapes. Show us your vision of tomorrow.",
    deadline: "2026-05-01",
  },
  {
    id: "2",
    title: "Nature Reimagined",
    description:
      "Use AI to reimagine nature scenes -- surreal landscapes, impossible flora, or mythical creatures in natural habitats.",
    deadline: "2026-05-15",
  },
  {
    id: "3",
    title: "30-Second Story",
    description:
      "Tell a compelling story in 30 seconds or less using AI-generated video. Narrative, emotion, and creativity are key.",
    deadline: "2026-06-01",
  },
];

export default function ContestsPage() {
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <Link
        href="/community"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
      >
        &larr; Back to Community
      </Link>
      <h1 className="text-3xl font-bold mb-2">Creative Challenges</h1>
      <p className="text-muted-foreground mb-8">
        Compete with fellow creators. Submit your best work before the deadline!
      </p>

      <div className="space-y-4">
        {CONTESTS.map((contest) => (
          <div
            key={contest.id}
            data-testid="contest-card"
            className="rounded-xl border border-border bg-white/5 p-6"
          >
            <h2 className="text-xl font-semibold mb-2">{contest.title}</h2>
            <p className="text-muted-foreground text-sm mb-3">
              {contest.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Deadline: {contest.deadline}
              </span>
              <Link
                href="/community/submit"
                className="px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Enter Challenge
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
