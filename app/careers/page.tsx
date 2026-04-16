import OpenRoleCard from "@/components/careers/open-role-card";

export const metadata = {
  title: "Careers at memacta",
  description: "Join us and build the creator tools of tomorrow.",
};

const ROLES = [
  {
    title: "Senior AI Engineer",
    location: "Remote",
    type: "Full-time",
    description:
      "Work on our fal.ai adapter layer and next-gen model pipeline. You'll own the inference abstraction that powers 33+ creation tools.",
    subject: "Application — Senior AI Engineer",
  },
  {
    title: "Full-Stack Engineer (Next.js)",
    location: "Remote",
    type: "Full-time",
    description:
      "Build fast, accessible UI surfaces for our creation and editing tools. Deep knowledge of React Server Components and Tailwind is a plus.",
    subject: "Application — Full-Stack Engineer",
  },
  {
    title: "Product Designer",
    location: "Remote",
    type: "Full-time",
    description:
      "Own the end-to-end design of memacta's creator experiences — from prompt guide to community gallery. Figma + sharp motion design sense required.",
    subject: "Application — Product Designer",
  },
  {
    title: "ML Research Engineer",
    location: "Remote",
    type: "Full-time",
    description:
      "Research and integrate new diffusion and video-generation models. You'll evaluate model quality, write benchmarks, and ship new model pages.",
    subject: "Application — ML Research Engineer",
  },
  {
    title: "Developer Advocate",
    location: "Remote",
    type: "Full-time",
    description:
      "Grow our creator and developer community. Write tutorials, host live demos, and maintain our open-source integrations.",
    subject: "Application — Developer Advocate",
  },
  {
    title: "Growth Marketing Manager",
    location: "Remote",
    type: "Full-time",
    description:
      "Own acquisition channels — SEO, social, and creator partnerships. You'll work closely with Product to turn generated content into viral moments.",
    subject: "Application — Growth Marketing Manager",
  },
];

const INFO_CARDS = [
  {
    heading: "Our mission",
    color: "text-cyan-400",
    points: [
      "Democratize creative AI for everyone.",
      "Lower the barrier from idea to video.",
      "Give every creator a world-class studio.",
    ],
  },
  {
    heading: "Our values",
    color: "text-pink-400",
    points: [
      "Ship fast, iterate in public.",
      "Creators first — always.",
      "Open source where possible.",
    ],
  },
  {
    heading: "How we work",
    color: "text-purple-400",
    points: [
      "Remote-first, async by default.",
      "Transparent decision-making.",
      "Equity for every team member.",
    ],
  },
];

export default function CareersPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-brand-gradient">Careers at memacta</h1>
        <p className="text-white/70 mt-2 text-lg">Build the creator tools of tomorrow.</p>
      </div>

      {/* Mission / Values / How we work */}
      <section className="mb-12">
        <div className="grid gap-5 sm:grid-cols-3">
          {INFO_CARDS.map((card) => (
            <div
              key={card.heading}
              className="rounded-xl bg-[#181828] border border-white/15 p-5"
            >
              <h2 className={`text-base font-bold mb-3 ${card.color}`}>{card.heading}</h2>
              <ul className="space-y-1.5">
                {card.points.map((pt) => (
                  <li key={pt} className="text-sm text-white/70 flex items-start gap-2">
                    <span className="mt-0.5 text-white/30">&mdash;</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Open roles */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-6">Open roles</h2>
        <div className="space-y-4">
          {ROLES.map((role) => (
            <OpenRoleCard key={role.title} {...role} />
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <div className="rounded-xl bg-[#181828] border border-white/15 p-6 text-center">
        <p className="text-white/70 text-sm mb-2">Don&apos;t see a fit?</p>
        <a
          href="mailto:careers@memacta.ai"
          className="text-brand-gradient font-semibold hover:opacity-80 transition-opacity"
        >
          careers@memacta.ai
        </a>
      </div>
    </main>
  );
}
