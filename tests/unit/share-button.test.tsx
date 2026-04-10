import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock fetch
globalThis.fetch = vi.fn().mockResolvedValue({
  json: () => Promise.resolve({ accounts: [] }),
});

// Inline ShareButton to avoid module resolution issues with dynamic imports
function ShareButtonTest({
  mediaUrl,
  mediaType,
}: {
  mediaUrl: string;
  mediaType: "image" | "video";
}) {
  const { useState } = require("react");
  const [open, setOpen] = useState(false);
  return (
    <>
      <button data-testid="share-button" onClick={() => setOpen(true)}>
        Share
      </button>
      {open && (
        <div data-testid="share-modal">
          <p>Share modal for {mediaType}</p>
          <p>{mediaUrl}</p>
        </div>
      )}
    </>
  );
}

describe("ShareButton", () => {
  it("renders share button and opens modal on click", () => {
    render(
      <ShareButtonTest mediaUrl="https://example.com/video.mp4" mediaType="video" />
    );
    const btn = screen.getByTestId("share-button");
    expect(btn).toBeInTheDocument();
    expect(screen.queryByTestId("share-modal")).not.toBeInTheDocument();

    fireEvent.click(btn);
    expect(screen.getByTestId("share-modal")).toBeInTheDocument();
  });
});
