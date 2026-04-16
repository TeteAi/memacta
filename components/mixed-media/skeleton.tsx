export default function MixedMediaSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 animate-pulse">
      <div className="h-4 w-32 bg-white/10 rounded mb-6" />
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-white/10" />
        <div className="space-y-2">
          <div className="h-7 w-48 bg-white/10 rounded" />
          <div className="h-3 w-64 bg-white/5 rounded" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-2xl bg-[#181828] border border-white/15 p-6">
          <div className="h-4 w-40 bg-white/10 rounded mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-[#181828] border border-white/15 p-6">
          <div className="h-4 w-32 bg-white/10 rounded mb-4" />
          <div className="h-24 bg-white/5 rounded-xl" />
        </div>
        <div className="rounded-2xl bg-[#181828] border border-white/15 p-6">
          <div className="h-4 w-36 bg-white/10 rounded mb-4" />
          <div className="h-10 bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
