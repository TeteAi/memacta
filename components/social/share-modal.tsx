"use client";

import { useState } from "react";
import { PLATFORMS, getPlatform } from "@/lib/social/platforms";

type SocialAccountInfo = {
  id: string;
  platform: string;
  username: string | null;
};

type Props = {
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  connectedAccounts: SocialAccountInfo[];
  onClose: () => void;
};

type PostStatus = {
  platform: string;
  status: "pending" | "success" | "error";
  error?: string;
};

export default function ShareModal({
  mediaUrl,
  mediaType,
  caption: initialCaption,
  connectedAccounts,
  onClose,
}: Props) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [caption, setCaption] = useState(initialCaption ?? "");
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [posting, setPosting] = useState(false);
  const [results, setResults] = useState<PostStatus[]>([]);

  const isConnected = (platformId: string) =>
    connectedAccounts.some((a) => a.platform === platformId);

  function togglePlatform(platformId: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  }

  const activePlatformMaxCaption = Math.min(
    ...selectedPlatforms
      .map((id) => getPlatform(id)?.maxCaptionLength ?? Infinity)
  );

  async function handlePost() {
    if (selectedPlatforms.length === 0) return;
    setPosting(true);
    setResults([]);
    try {
      const body: Record<string, unknown> = {
        platforms: selectedPlatforms,
        mediaUrl,
        mediaType,
        caption: caption || undefined,
      };
      if (scheduleMode && scheduledFor) {
        body.scheduledFor = new Date(scheduledFor).toISOString();
      }
      const res = await fetch("/api/social/post", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.scheduled) {
        setResults(
          selectedPlatforms.map((p) => ({ platform: p, status: "success" as const }))
        );
      } else if (data.results) {
        setResults(
          data.results.map((r: { platform: string; success: boolean; error?: string }) => ({
            platform: r.platform,
            status: r.success ? ("success" as const) : ("error" as const),
            error: r.error,
          }))
        );
      }
    } catch {
      setResults(
        selectedPlatforms.map((p) => ({ platform: p, status: "error" as const, error: "Network error" }))
      );
    } finally {
      setPosting(false);
    }
  }

  return (
    <>
      {/* Backdrop — blocks all page content behind */}
      <div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal positioner */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
        data-testid="share-modal"
      >
        {/* Modal card — pointer-events restored so clicks don't fall through to backdrop */}
        <div
          className="pointer-events-auto bg-[#12121e] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-purple-500/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="text-lg font-bold text-white">Share to Social</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors text-xl leading-none"
              data-testid="share-modal-close"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="px-6 pb-6 space-y-5">
            {/* Platform selection */}
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map((platform) => {
                const connected = isConnected(platform.id);
                const selected = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => connected && togglePlatform(platform.id)}
                    disabled={!connected && false /* always clickable for UX */}
                    className={[
                      "rounded-xl border p-4 text-left transition-all cursor-pointer",
                      selected
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-white/10 bg-[#1a1a2e] hover:border-purple-500/40",
                    ].join(" ")}
                    data-testid={`share-platform-${platform.id}`}
                    title={!connected ? "Connect this account first" : platform.name}
                  >
                    <span className="font-bold text-white block mb-2">
                      {platform.name}
                    </span>
                    {connected ? (
                      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                        Connected
                      </span>
                    ) : (
                      <a
                        href="/account"
                        className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Link account
                      </a>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Caption */}
            <div>
              <label className="text-sm text-white/60 block mb-2">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                placeholder="Write a caption..."
                className="bg-[#1e1e32] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none w-full resize-none transition-colors"
                data-testid="share-caption"
              />
              {selectedPlatforms.length > 0 && activePlatformMaxCaption < Infinity && (
                <p className="text-xs text-white/40 mt-1 text-right">
                  {caption.length}/{activePlatformMaxCaption} characters
                </p>
              )}
            </div>

            {/* Schedule toggle */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={scheduleMode}
                  onChange={(e) => setScheduleMode(e.target.checked)}
                  className="w-4 h-4 accent-purple-500 rounded"
                  data-testid="schedule-toggle"
                />
                <span className="text-sm text-white/80">Schedule for later</span>
              </label>
              {scheduleMode && (
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="bg-[#1e1e32] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none w-full transition-colors"
                  data-testid="schedule-datetime"
                />
              )}
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-2">
                {results.map((r) => (
                  <div
                    key={r.platform}
                    className={[
                      "text-sm px-4 py-2 rounded-xl font-medium",
                      r.status === "success"
                        ? "bg-green-500/15 text-green-400 border border-green-500/20"
                        : "bg-red-500/15 text-red-400 border border-red-500/20",
                    ].join(" ")}
                    data-testid={`post-result-${r.platform}`}
                  >
                    {getPlatform(r.platform)?.name}:{" "}
                    {r.status === "success" ? "Posted successfully!" : r.error || "Failed"}
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 justify-end pt-1">
              <button
                onClick={onClose}
                className="bg-white/10 text-white hover:bg-white/20 rounded-xl px-6 py-2.5 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={posting || selectedPlatforms.length === 0}
                className="bg-brand-gradient text-white font-semibold rounded-xl px-6 py-2.5 text-sm glow-btn disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-opacity"
                data-testid="share-post-button"
              >
                {posting
                  ? "Posting..."
                  : scheduleMode
                  ? "Schedule"
                  : "Post Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
