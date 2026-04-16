interface ProfileTopModelsProps {
  models: Array<{ name: string; count: number }>;
}

export default function ProfileTopModels({ models }: ProfileTopModelsProps) {
  if (models.length === 0) return null;

  return (
    <div data-testid="profile-top-models" className="mb-8">
      <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
        Top Models
      </h2>
      <div className="flex flex-wrap gap-2">
        {models.map((m) => (
          <span
            key={m.name}
            className="px-3 py-1 rounded-full border border-white/15 bg-[#181828] text-sm text-white/80 hover:border-purple-500/40 transition-colors"
          >
            #{m.name.replace(/\s+/g, "")}
          </span>
        ))}
      </div>
    </div>
  );
}
