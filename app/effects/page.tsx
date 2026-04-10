import { EFFECTS } from "@/lib/effects";
import { EffectsGrid } from "@/components/effects/effects-grid";

export const metadata = { title: "memacta – Effects" };

export default function Page() {
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Effects</h1>
      <p className="text-white/70">Browse visual effects and trending templates.</p>
      <EffectsGrid effects={EFFECTS} />
    </main>
  );
}
