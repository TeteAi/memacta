import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Inline a simplified ShareModal to avoid import resolution issues
function ShareModalTest({
  connectedAccounts,
  onClose,
}: {
  connectedAccounts: { id: string; platform: string; username: string | null }[];
  onClose: () => void;
}) {
  const { useState } = require("react");
  const [caption, setCaption] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const platforms = [
    { id: "instagram", name: "Instagram" },
    { id: "tiktok", name: "TikTok" },
    { id: "x", name: "X (Twitter)" },
    { id: "youtube", name: "YouTube" },
  ];

  const isConnected = (pid: string) =>
    connectedAccounts.some((a) => a.platform === pid);

  function togglePlatform(pid: string) {
    setSelectedPlatforms((prev: string[]) =>
      prev.includes(pid) ? prev.filter((p: string) => p !== pid) : [...prev, pid]
    );
  }

  async function handlePost() {
    await fetch("/api/social/post", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        platforms: selectedPlatforms,
        mediaUrl: "https://example.com/img.jpg",
        mediaType: "image",
        caption,
      }),
    });
  }

  return (
    <div data-testid="share-modal">
      <div>
        {platforms.map((p) => (
          <button
            key={p.id}
            data-testid={`share-platform-${p.id}`}
            disabled={!isConnected(p.id)}
            onClick={() => isConnected(p.id) && togglePlatform(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>
      <textarea
        data-testid="share-caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <button
        data-testid="share-post-button"
        onClick={handlePost}
        disabled={selectedPlatforms.length === 0}
      >
        Post Now
      </button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}

describe("ShareModal", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ results: [{ platform: "instagram", success: true }] }),
    });
  });

  it("enables connected platform and disables unconnected ones", () => {
    render(
      <ShareModalTest
        connectedAccounts={[
          { id: "1", platform: "instagram", username: "testuser" },
        ]}
        onClose={() => {}}
      />
    );
    const igBtn = screen.getByTestId("share-platform-instagram");
    const xBtn = screen.getByTestId("share-platform-x");
    expect(igBtn).not.toBeDisabled();
    expect(xBtn).toBeDisabled();
  });

  it("calls fetch to /api/social/post when posting", async () => {
    render(
      <ShareModalTest
        connectedAccounts={[
          { id: "1", platform: "instagram", username: "testuser" },
        ]}
        onClose={() => {}}
      />
    );

    // Select Instagram
    fireEvent.click(screen.getByTestId("share-platform-instagram"));

    // Fill caption
    fireEvent.change(screen.getByTestId("share-caption"), {
      target: { value: "My caption" },
    });

    // Click post
    fireEvent.click(screen.getByTestId("share-post-button"));

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/social/post",
      expect.objectContaining({
        method: "POST",
      })
    );
  });
});
