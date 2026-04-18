import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import PersonaCard from "@/components/persona/PersonaCard";

export const metadata = {
  title: "Personas | memacta",
  description: "Create and manage your AI personas",
};

export default async function PersonasPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    redirect("/auth/signin?callbackUrl=/personas");
  }

  const personas = await prisma.persona.findMany({
    where: { userId, archivedAt: null },
    include: {
      photos: { where: { isPrimary: true }, take: 1 },
      _count: { select: { generations: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Personas</h1>
          <p className="text-white/50 text-sm mt-1">
            Your AI identities. Use them in any generation.
          </p>
        </div>
        <Link
          href="/personas/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Persona
        </Link>
      </div>

      {personas.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">No personas yet</h2>
          <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
            Create your first Persona to use your face (or anyone&apos;s with permission) in any generation.
          </p>
          <Link
            href="/personas/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create First Persona
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {personas.map((persona) => (
            <PersonaCard
              key={persona.id}
              id={persona.id}
              name={persona.name}
              tier={persona.tier}
              status={persona.status}
              primaryPhotoUrl={persona.photos[0]?.url}
              coverImageUrl={persona.coverImageUrl}
              generationCount={persona._count.generations}
              trainingStartedAt={persona.trainingStartedAt}
            />
          ))}
        </div>
      )}
    </main>
  );
}
