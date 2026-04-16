import { Suspense } from "react";
import Copilot from "@/components/copilot/copilot";

export const metadata = {
  title: "memacta - Copilot",
  description:
    "Your AI director — I'll pick the right model, tool, and preset for your creative vision.",
};

export default function CopilotPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-brand-gradient">Copilot</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300 font-medium border border-fuchsia-500/20">
                beta
              </span>
            </div>
            <p className="text-sm text-white/50 mt-0.5">
              Your AI director — I&apos;ll pick the right model, tool, and preset.
            </p>
          </div>
        </div>
      </div>

      {/* Copilot chat area */}
      <div className="flex-1 rounded-2xl bg-[#181828] border border-white/15 overflow-hidden flex flex-col min-h-0">
        <Suspense>
          <Copilot />
        </Suspense>
      </div>
    </main>
  );
}
