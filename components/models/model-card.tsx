import Link from "next/link";
import { ModelInfo } from "@/lib/ai/models";
import { MODEL_DETAILS } from "@/lib/ai/model-details";

type Props = { model: ModelInfo };

export default function ModelCard({ model }: Props) {
  const details = MODEL_DETAILS[model.id];

  return (
    <Link
      href={`/models/${model.id}`}
      data-testid={`model-card-${model.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-white/15 bg-[#181828] p-5 hover:border-white/30 hover:bg-[#1e1e32] transition-all"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-white group-hover:text-transparent group-hover:bg-brand-gradient group-hover:bg-clip-text transition-all">
              {model.name}
            </span>
            {model.badge && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider
                  ${model.badge === "pro" ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30" : ""}
                  ${model.badge === "new" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : ""}
                  ${model.badge === "fast" ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" : ""}
                `}
              >
                {model.badge}
              </span>
            )}
          </div>
        </div>
        <span
          className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
            ${model.mediaType === "video" ? "bg-purple-500/15 text-purple-300 border border-purple-500/20" : "bg-pink-500/15 text-pink-300 border border-pink-500/20"}
          `}
        >
          {model.mediaType}
        </span>
      </div>

      {/* Tagline */}
      <p className="text-sm text-white/60 leading-snug line-clamp-2">
        {details?.tagline ?? model.description}
      </p>

      {/* Arrow */}
      <div className="flex items-center gap-1 text-xs text-white/30 group-hover:text-white/60 transition-colors mt-auto">
        <span>View model</span>
        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </Link>
  );
}
