import { ModelDetails } from "@/lib/ai/model-details";
import { getModel } from "@/lib/ai/models";

type Props = { details: ModelDetails };

export default function ModelSpecs({ details }: Props) {
  const model = getModel(details.id);

  const rows: { label: string; value: string }[] = [
    { label: "Media type", value: model?.mediaType ?? "video" },
    { label: "Aspect ratios", value: details.supportedAspects.join(", ") },
    ...(details.maxDurationSec ? [{ label: "Duration", value: `up to ${details.maxDurationSec}s` }] : []),
    { label: "Provider", value: details.provider },
    { label: "Endpoint", value: details.falEndpoint },
  ];

  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-4">Specs</h2>
      <div className="rounded-xl border border-white/15 overflow-hidden divide-y divide-white/10">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-4 px-4 py-3 bg-[#181828]">
            <span className="w-32 flex-shrink-0 text-sm text-white/50 font-medium">{row.label}</span>
            <span className="text-sm text-white/90 font-mono break-all">{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
