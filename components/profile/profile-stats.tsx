interface ProfileStatsProps {
  totalPosts: number;
  totalLikes: number;
  uniqueModels: number;
  joinedAt?: string | null; // ISO date string or null for featured creators
  isFeatured?: boolean;
}

export default function ProfileStats({
  totalPosts,
  totalLikes,
  uniqueModels,
  joinedAt,
  isFeatured = false,
}: ProfileStatsProps) {
  const stats = [
    { label: "Posts", value: totalPosts.toString() },
    { label: "Likes", value: totalLikes.toString() },
    { label: "Models used", value: uniqueModels.toString() },
    {
      label: "Joined",
      value: isFeatured
        ? "Featured creator"
        : joinedAt
        ? joinedAt.split("T")[0]
        : "—",
    },
  ];

  return (
    <div
      data-testid="profile-stats"
      className="flex flex-wrap gap-4 mb-8"
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="px-4 py-3 rounded-xl border border-white/15 bg-[#181828] min-w-[110px] text-center"
        >
          <p className="text-lg font-bold text-white">{s.value}</p>
          <p className="text-xs text-white/60 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
