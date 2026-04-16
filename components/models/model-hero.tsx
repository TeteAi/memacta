import Link from "next/link";
import { ModelDetails } from "@/lib/ai/model-details";
import { getModel } from "@/lib/ai/models";

type Props = { details: ModelDetails };

export default function ModelHero({ details }: Props) {
  const model = getModel(details.id);
  const createHref =
    details.id === "soul-v2" ||
    model?.mediaType === "image"
      ? `/create/image?model=${details.id}`
      : `/create/video?model=${details.id}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-white/50">
        <Link href="/models" className="hover:text-white transition-colors">
          Models
        </Link>
        <span className="text-white/30">/</span>
        <span className="text-white/80">{model?.name ?? details.id}</span>
      </div>

      {/* Hero row */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-2 mb-3">
            {/* Badge */}
            {model?.badge && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider
                  ${model.badge === "pro" ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30" : ""}
                  ${model.badge === "new" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : ""}
                  ${model.badge === "fast" ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" : ""}
                `}
              >
                {model.badge}
              </span>
            )}
            {/* Media type pill */}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${model?.mediaType === "video" ? "bg-purple-500/15 text-purple-300 border border-purple-500/20" : "bg-pink-500/15 text-pink-300 border border-pink-500/20"}
              `}
            >
              {model?.mediaType ?? "video"}
            </span>
          </div>

          <h1 className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent mb-2">
            {model?.name ?? details.id}
          </h1>
          <p className="text-white/70 text-lg mb-6">{details.tagline}</p>
          <p className="text-white/60 text-base leading-relaxed mb-8">{details.pitch}</p>

          <Link
            href={createHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-gradient text-white font-bold text-sm hover:opacity-90 transition-all glow-btn"
          >
            Try {model?.name ?? details.id}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
