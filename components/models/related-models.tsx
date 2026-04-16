import Link from "next/link";
import { getModel } from "@/lib/ai/models";

type Props = { relatedIds: string[] };

export default function RelatedModels({ relatedIds }: Props) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-4">Related Models</h2>
      <div className="flex flex-wrap gap-3">
        {relatedIds.map((id) => {
          const model = getModel(id);
          return (
            <Link
              key={id}
              href={`/models/${id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-[#181828] text-sm text-white/80 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all"
            >
              {model?.name ?? id}
              {model?.badge && (
                <span className="text-xs text-white/40">{model.badge}</span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
