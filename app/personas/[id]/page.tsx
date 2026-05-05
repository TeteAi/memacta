import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import PersonaDetailHeader from "@/components/persona/PersonaDetailHeader";
import UpgradeCta from "@/components/persona/UpgradeCta";
import TrainingProgress from "@/components/persona/TrainingProgress";
import PersonaDetailClient from "./PersonaDetailClient";
import { canStartPremiumTrain } from "@/lib/persona/gates";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  // Persona name is biometric likeness data (often a real person's
  // identifier under BIPA / GDPR Art.9). The page body is correctly
  // ownership-gated below, but `generateMetadata` runs without auth and
  // its output ends up in <title> — visible in HTML even when the user
  // isn't signed in. Only reveal the name when the requesting session
  // owns the persona; otherwise return a generic title.
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (userId) {
    const persona = await prisma.persona.findFirst({
      where: { id, userId, archivedAt: null },
      select: { name: true },
    });
    if (persona) {
      return { title: `${persona.name} | Personas | memacta` };
    }
  }
  return { title: "Persona | memacta" };
}

export default async function PersonaDetailPage({ params }: Props) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const persona = await prisma.persona.findFirst({
    where: { id, userId, archivedAt: null },
    include: {
      photos: { orderBy: { createdAt: "asc" } },
      _count: { select: { generations: true } },
      generations: {
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, resultUrl: true, createdAt: true, model: true },
      },
    },
  });

  if (!persona) notFound();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      emailVerified: true,
      createdAt: true,
      premiumLoraTrainsUsed: true,
      subscription: { select: { planId: true } },
    },
  });

  const gate = user ? canStartPremiumTrain(user) : { allowed: false, reason: "user_not_found" };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/personas" className="text-white/50 hover:text-white transition-colors">
          Personas
        </Link>
        <span className="text-white/30">/</span>
        <span className="text-white/80 truncate">{persona.name}</span>
      </div>

      {/* Client component handles delete/navigate */}
      <PersonaDetailClient personaId={persona.id} userId={userId}>
        <PersonaDetailHeader
          id={persona.id}
          name={persona.name}
          tier={persona.tier}
          status={persona.status}
          coverImageUrl={persona.coverImageUrl}
          generationCount={persona._count.generations}
        />
      </PersonaDetailClient>

      {/* Training progress (auto-polls) */}
      {persona.status === "TRAINING" && (
        <TrainingProgress
          personaId={persona.id}
          initialStatus={persona.status}
          initialTier={persona.tier}
        />
      )}

      {/* Upgrade CTA */}
      {persona.tier === "INSTANT" && (
        <UpgradeCta
          personaId={persona.id}
          status={persona.status}
          tier={persona.tier}
          canUpgrade={gate.allowed}
          blockReason={gate.reason}
        />
      )}

      {/* Trigger word (for premium) */}
      {persona.tier === "PREMIUM" && persona.status === "READY" && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-white/40 text-xs mb-1">Trigger word (auto-prepended to prompts)</p>
          <p className="text-cyan-300 font-mono text-sm font-medium">{persona.triggerWord}</p>
        </div>
      )}

      {/* Recent generations */}
      {persona.generations.length > 0 && (
        <div>
          <h2 className="text-white font-semibold mb-3">Recent Generations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {persona.generations.map((gen) => (
              <div key={gen.id} className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#1e1e32]">
                {gen.resultUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={gen.resultUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
