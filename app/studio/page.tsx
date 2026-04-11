import Link from "next/link";
import StudioEditor from "@/components/studio/studio-editor";

export default function StudioPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-brand-gradient bg-clip-text text-transparent">Cinema Studio</h1>
          <p className="text-white/50 mt-2">Compose multi-shot cinematic sequences with AI</p>
        </div>
        <Link
          href="/studio/projects"
          className="text-sm font-medium px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          Saved Projects
        </Link>
      </div>
      <div className="rounded-2xl bg-[#12121e] border border-white/10 p-6">
        <StudioEditor />
      </div>
    </main>
  );
}
