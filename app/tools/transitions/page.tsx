import Link from "next/link";
import TransitionsTool from "@/components/transitions/transitions-tool";

export const metadata = {
  title: "Transitions — memacta",
  description:
    "CapCut-style AI transitions between clips. Drop two clips, pick a preset, generate.",
};

export default function TransitionsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb + header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href="/tools"
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            Tools
          </Link>
          <span className="text-white/30">/</span>
          <span className="text-sm text-white/70">Editing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-gradient">
          Transitions
        </h1>
        <p className="text-white/70 mt-2 max-w-xl">
          Pick two clips, choose a preset, and let memacta stitch a smooth
          AI-generated transition between them.
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/15 text-white/70 font-medium">
            Editing
          </span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-medium">
            Output: video
          </span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-fuchsia-500/15 text-fuchsia-300 font-medium">
            CapCut-style presets
          </span>
        </div>
      </div>

      {/* Tool body */}
      <div className="rounded-2xl bg-[#181828] border border-white/15 p-5 sm:p-6">
        <TransitionsTool />
      </div>
    </main>
  );
}
