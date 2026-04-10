import Link from "next/link";
import StudioEditor from "@/components/studio/studio-editor";

export default function StudioPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Cinema Studio</h1>
        <Link href="/studio/projects" className="text-sm text-muted-foreground hover:text-foreground underline">
          Browse saved projects →
        </Link>
      </div>
      <p className="text-muted-foreground mb-6">
        Compose multi-shot cinematic sequences. Add clips, reorder them, and save your project.
      </p>
      <StudioEditor />
    </main>
  );
}
