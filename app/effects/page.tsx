import { EFFECTS } from "@/lib/effects";
import { EffectsGrid } from "@/components/effects/effects-grid";

export const metadata = { title: "memacta – Effects" };

export default function Page() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-brand-gradient bg-clip-text text-transparent">Effects & Templates</h1>
        <p className="text-white/70 mt-2">Browse 100+ visual effects and trending templates to enhance your creations</p>
      </div>
      <EffectsGrid effects={EFFECTS} />
    </main>
  );
}
