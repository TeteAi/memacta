"use client";

import Link from "next/link";

type Stats = {
  credits: number;
  totalGenerations: number;
  totalPosted: number;
  totalScheduled: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagement: number;
};

type PostData = {
  id: string;
  platform: string;
  caption: string;
  mediaUrl: string;
  mediaType: string;
  postedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
};

type UpcomingPost = {
  id: string;
  platform: string;
  caption: string;
  mediaType: string;
  scheduledFor: string;
};

type Creation = {
  id: string;
  prompt: string;
  mediaType: string;
  resultUrl: string | null;
  status: string;
  createdAt: string;
};

type ConnectedPlatform = {
  platform: string;
  username: string;
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "from-purple-500 to-pink-500",
  tiktok: "from-cyan-400 to-pink-500",
  x: "from-gray-400 to-gray-600",
  youtube: "from-red-500 to-red-700",
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
  ),
  tiktok: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.8a8.16 8.16 0 004.77 1.52V6.87a4.84 4.84 0 01-1-.18z"/></svg>
  ),
  x: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  ),
  youtube: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  ),
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function StatCard({ label, value, icon, gradient }: { label: string; value: string; icon: React.ReactNode; gradient?: string }) {
  return (
    <div className="rounded-xl bg-[#12121e] border border-white/10 p-5 hover:border-purple-500/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/40 text-sm">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${gradient ?? "bg-white/10"} text-white`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function DashboardClient({
  userName,
  stats,
  recentPosts,
  upcoming,
  recentCreations,
  connectedPlatforms,
}: {
  userName: string;
  stats: Stats;
  recentPosts: PostData[];
  upcoming: UpcomingPost[];
  recentCreations: Creation[];
  connectedPlatforms: ConnectedPlatform[];
}) {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, <span className="bg-brand-gradient bg-clip-text text-transparent">{userName}</span>
          </h1>
          <p className="text-white/40 mt-1">Here&apos;s how your content is performing</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/create"
            className="px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold hover:opacity-90 transition-all glow-btn"
          >
            + Create New
          </Link>
          <Link
            href="/account"
            className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <StatCard
          label="Credits"
          value={formatNumber(stats.credits)}
          gradient="bg-gradient-to-br from-purple-500 to-pink-500"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Creations"
          value={formatNumber(stats.totalGenerations)}
          gradient="bg-gradient-to-br from-cyan-400 to-blue-500"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>}
        />
        <StatCard
          label="Views"
          value={formatNumber(stats.totalViews)}
          gradient="bg-gradient-to-br from-green-400 to-emerald-500"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard
          label="Likes"
          value={formatNumber(stats.totalLikes)}
          gradient="bg-gradient-to-br from-pink-500 to-rose-500"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>}
        />
        <StatCard
          label="Shares"
          value={formatNumber(stats.totalShares)}
          gradient="bg-gradient-to-br from-orange-400 to-amber-500"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>}
        />
        <StatCard
          label="Engagement"
          value={`${stats.avgEngagement.toFixed(1)}%`}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        {/* Connected Platforms */}
        <div className="rounded-2xl bg-[#12121e] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Platforms</h2>
            <Link href="/account" className="text-xs text-white/40 hover:text-white transition-colors">Manage</Link>
          </div>
          {connectedPlatforms.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/40 text-sm mb-4">No platforms connected yet</p>
              <Link
                href="/account"
                className="text-sm px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Connect Accounts
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {connectedPlatforms.map((p) => (
                <div key={p.platform} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${PLATFORM_COLORS[p.platform] ?? "from-gray-500 to-gray-600"} flex items-center justify-center text-white`}>
                    {PLATFORM_ICONS[p.platform]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white capitalize">{p.platform}</p>
                    <p className="text-xs text-white/40 truncate">@{p.username}</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-green-400" title="Connected" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Scheduled Posts */}
        <div className="rounded-2xl bg-[#12121e] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Scheduled</h2>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/50">{upcoming.length} pending</span>
          </div>
          {upcoming.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/40 text-sm mb-4">No scheduled posts</p>
              <Link
                href="/create"
                className="text-sm px-4 py-2 rounded-lg bg-brand-gradient text-white hover:opacity-90 transition-all"
              >
                Create & Schedule
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${PLATFORM_COLORS[post.platform] ?? "from-gray-500 to-gray-600"} flex items-center justify-center text-white flex-shrink-0`}>
                    {PLATFORM_ICONS[post.platform]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 truncate">{post.caption || "No caption"}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      {new Date(post.scheduledFor).toLocaleDateString()} at{" "}
                      {new Date(post.scheduledFor).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full flex-shrink-0">
                    {post.mediaType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Creations */}
        <div className="rounded-2xl bg-[#12121e] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Recent Creations</h2>
            <Link href="/library" className="text-xs text-white/40 hover:text-white transition-colors">View all</Link>
          </div>
          {recentCreations.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/40 text-sm mb-4">No creations yet</p>
              <Link
                href="/create"
                className="text-sm px-4 py-2 rounded-lg bg-brand-gradient text-white hover:opacity-90 transition-all"
              >
                Start Creating
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentCreations.slice(0, 5).map((c) => (
                <Link key={c.id} href={`/library/${c.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                    {c.resultUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.resultUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                        {c.mediaType === "video" ? "VID" : "IMG"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 truncate">{c.prompt}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                    c.status === "completed" ? "bg-green-500/20 text-green-400" :
                    c.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {c.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Posted Content Performance */}
      <div className="rounded-2xl bg-[#12121e] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Content Performance</h2>
            <p className="text-xs text-white/40 mt-0.5">Track how your posted content is performing across platforms</p>
          </div>
        </div>

        {recentPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 mx-auto rounded-xl bg-white/5 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <p className="text-white/50 text-sm mb-2">No posted content yet</p>
            <p className="text-white/30 text-xs mb-6 max-w-sm mx-auto">
              Create content, share it to your connected platforms, and track performance here
            </p>
            <Link
              href="/create"
              className="inline-block px-6 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold glow-btn"
            >
              Create Content
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 font-medium text-white/50">Content</th>
                  <th className="text-left p-3 font-medium text-white/50">Platform</th>
                  <th className="text-right p-3 font-medium text-white/50">Views</th>
                  <th className="text-right p-3 font-medium text-white/50">Likes</th>
                  <th className="text-right p-3 font-medium text-white/50">Comments</th>
                  <th className="text-right p-3 font-medium text-white/50">Shares</th>
                  <th className="text-right p-3 font-medium text-white/50">Rate</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post) => (
                  <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                          {post.mediaType === "video" ? (
                            <video src={post.mediaUrl} className="w-full h-full object-cover" muted />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="text-white/70 truncate max-w-[150px]">{post.caption || "No caption"}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${PLATFORM_COLORS[post.platform] ?? "from-gray-500 to-gray-600"} flex items-center justify-center text-white`}>
                          {PLATFORM_ICONS[post.platform]}
                        </div>
                        <span className="text-white/50 capitalize text-xs">{post.platform}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right text-white/70">{formatNumber(post.views)}</td>
                    <td className="p-3 text-right text-white/70">{formatNumber(post.likes)}</td>
                    <td className="p-3 text-right text-white/70">{formatNumber(post.comments)}</td>
                    <td className="p-3 text-right text-white/70">{formatNumber(post.shares)}</td>
                    <td className="p-3 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        post.engagementRate >= 5 ? "bg-green-500/20 text-green-400" :
                        post.engagementRate >= 2 ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-white/10 text-white/50"
                      }`}>
                        {post.engagementRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <Link
          href="/create"
          className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">Create Content</p>
            <p className="text-xs text-white/40">Generate videos & images</p>
          </div>
        </Link>

        <Link
          href="/library"
          className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">My Library</p>
            <p className="text-xs text-white/40">Browse your creations</p>
          </div>
        </Link>

        <Link
          href="/community"
          className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white group-hover:text-orange-300 transition-colors">Community</p>
            <p className="text-xs text-white/40">Share & get inspired</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
