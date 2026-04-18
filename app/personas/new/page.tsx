import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import PersonaWizard from "@/components/persona/PersonaWizard";

export const metadata = {
  title: "New Persona | memacta",
  description: "Create a new AI persona",
};

export default async function NewPersonaPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    redirect("/auth/signin?callbackUrl=/personas/new");
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/personas" className="text-white/50 hover:text-white transition-colors">
          Personas
        </Link>
        <span className="text-white/30">/</span>
        <span className="text-white/80">New Persona</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Persona</h1>
            <p className="text-sm text-white/50">
              Upload photos, get an instant identity. Upgrade to Premium for 92-98% match.
            </p>
          </div>
        </div>
      </div>

      <PersonaWizard />
    </main>
  );
}
