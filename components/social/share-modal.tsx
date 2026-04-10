"use client";

import { useState } from "react";
import { PLATFORMS, getPlatform } from "@/lib/social/platforms";
import { Button } from "@/components/ui/button";

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      data-testid="share-modal"
    >
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Share to Social</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            data-testid="share-modal-close"
          >
            X
          </button>
        </div>

        {/* Platform selection */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {PLATFORMS.map((platform) => {
            const connected = isConnected(platform.id);
            const selected = selectedPlatforms.includes(platform.id);
            return (
              <button
                key={platform.id}
                onClick={() => connected && togglePlatform(platform.id)}
                disabled={!connected}
                className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                  !connected
                    ? "opacity-40 cursor-not-allowed border-border"
                    : selected
                    ? "border-brand-cyan bg-brand-cyan/10"
                    : "border-border hover:border-muted-foreground"
                }`}
                data-testid={`share-platform-${platform.id}`}
                title={!connected ? "Connect this account first" : platform.name}
              >
                <span className="font-medium">{platform.name}</span>
                {!connected && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    <a href="/account" className="underline">
                      Link account
                    </a>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Caption */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground block mb-1">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none"
            data-testid="share-caption"
          />
          {selectedPlatforms.length > 0 && activePlatformMaxCaption < Infinity && (
            <p className="text-xs text-muted-foreground mt-1">
              {caption.length}/{activePlatformMaxCaption} characters
            </p>
          )}
        </div>

        {/* Schedule toggle */}
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={scheduleMode}
              onChange={(e) => setScheduleMode(e.target.checked)}
              data-testid="schedule-toggle"
            />
            Schedule for later
          </label>
          {scheduleMode && (
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="bg-background border border-border rounded-lg px-2 py-1 text-sm"
              data-testid="schedule-datetime"
            />
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mb-4 space-y-1">
            {results.map((r) => (
              <div
                key={r.platform}
                className={`text-sm px-3 py-1 rounded ${
                  r.status === "success"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
                data-testid={`post-result-${r.platform}`}
              >
                {getPlatform(r.platform)?.name}:{" "}
                {r.status === "success" ? "Posted!" : r.error || "Failed"}
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handlePost}
            disabled={posting || selectedPlatforms.length === 0}
            data-testid="share-post-button"
          >
            {posting
              ? "Posting..."
              : scheduleMode
              ? "Schedule"
              : "Post Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
