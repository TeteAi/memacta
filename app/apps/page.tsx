import Link from "next/link";
import { P2_TOOLS } from "@/lib/tools/p2-tools";
import { P3_TOOLS } from "@/lib/tools/p3-tools";

export const metadata = { title: "memacta – Apps" };

const ALL_TOOLS = [...P2_TOOLS, ...P3_TOOLS];

export default function AppsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold bg-brand-gradient bg-clip-text text-transparent">All Apps & Tools</h1>
        <p className="text-white/70 mt-2">{ALL_TOOLS.length}+ AI-powered creative tools at your fingertips</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {ALL_TOOLS.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="rounded-xl border border-white/15 bg-[#181828] p-5 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">{tool.name}</h3>
            <p className="text-sm text-white/60 mt-1">{tool.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/70 capitalize">{tool.category}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">{tool.mediaOut}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
