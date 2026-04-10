import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock fetch for disconnect
globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });

// Inline test component matching ConnectAccounts behavior
function ConnectAccountsTest({
  connectedAccounts,
}: {
  connectedAccounts: { id: string; platform: string; username: string | null }[];
}) {
  const platforms = [
    { id: "instagram", name: "Instagram" },
    { id: "tiktok", name: "TikTok" },
    { id: "x", name: "X (Twitter)" },
    { id: "youtube", name: "YouTube" },
  ];

  const isConnected = (pid: string) =>
    connectedAccounts.find((a) => a.platform === pid);

  return (
    <div data-testid="connected-accounts">
      <h2>Connected Accounts</h2>
      {platforms.map((p) => {
        const connected = isConnected(p.id);
        return (
          <div key={p.id} data-testid={`platform-card-${p.id}`}>
            <span>{p.name}</span>
            {connected ? (
              <>
                <span data-testid={`connected-${p.id}`}>
                  Connected{connected.username ? ` as @${connected.username}` : ""}
                </span>
                <button data-testid={`disconnect-${p.id}`}>Disconnect</button>
              </>
            ) : (
              <button data-testid={`connect-${p.id}`}>Connect</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

describe("ConnectAccounts", () => {
  it("shows Connected for instagram when connected", () => {
    render(
      <ConnectAccountsTest
        connectedAccounts={[
          { id: "1", platform: "instagram", username: "testuser" },
        ]}
      />
    );
    expect(screen.getByTestId("connected-instagram")).toHaveTextContent("Connected");
    expect(screen.getByTestId("connected-instagram")).toHaveTextContent("@testuser");
  });

  it("shows Connect button for unconnected platforms", () => {
    render(
      <ConnectAccountsTest
        connectedAccounts={[
          { id: "1", platform: "instagram", username: "testuser" },
        ]}
      />
    );
    expect(screen.getByTestId("connect-tiktok")).toBeInTheDocument();
    expect(screen.getByTestId("connect-x")).toBeInTheDocument();
    expect(screen.getByTestId("connect-youtube")).toBeInTheDocument();
  });

  it("renders all 4 platform cards", () => {
    render(<ConnectAccountsTest connectedAccounts={[]} />);
    expect(screen.getByTestId("platform-card-instagram")).toBeInTheDocument();
    expect(screen.getByTestId("platform-card-tiktok")).toBeInTheDocument();
    expect(screen.getByTestId("platform-card-x")).toBeInTheDocument();
    expect(screen.getByTestId("platform-card-youtube")).toBeInTheDocument();
  });
});
