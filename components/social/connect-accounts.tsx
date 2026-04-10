"use client";

import { useState } from "react";
import { PLATFORMS } from "@/lib/social/platforms";
import { Button } from "@/components/ui/button";

type SocialAccountInfo = {
  id: string;
  platform: string;
  username: string | null;
};

type Props = {
  connectedAccounts: SocialAccountInfo[];
};

export default function ConnectAccounts({ connectedAccounts }: Props) {
  const [accounts, setAccounts] = useState<SocialAccountInfo[]>(connectedAccounts);
  const [loading, setLoading] = useState<string | null>(null);

  const isConnected = (platformId: string) =>
    accounts.find((a) => a.platform === platformId);

  async function handleConnect(platformId: string) {
    setLoading(platformId);
    // Redirect to OAuth stub endpoint
    window.location.href = `/api/social/auth/${platformId}`;
  }

  async function handleDisconnect(platformId: string) {
    setLoading(platformId);
    try {
      const res = await fetch(`/api/social/accounts/${platformId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.platform !== platformId));
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div data-testid="connected-accounts">
      <h2 className="text-xl font-bold mb-4">Connected Accounts</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const connected = isConnected(platform.id);
          return (
            <div
              key={platform.id}
              className="rounded-xl border border-border bg-card p-4 flex items-center justify-between"
              data-testid={`platform-card-${platform.id}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: platform.color }}
                >
                  {platform.name[0]}
                </span>
                <div>
                  <p className="font-medium">{platform.name}</p>
                  {connected ? (
                    <p className="text-xs text-green-400" data-testid={`connected-${platform.id}`}>
                      Connected{connected.username ? ` as @${connected.username}` : ""}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not connected</p>
                  )}
                </div>
              </div>
              {connected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(platform.id)}
                  disabled={loading === platform.id}
                  data-testid={`disconnect-${platform.id}`}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleConnect(platform.id)}
                  disabled={loading === platform.id}
                  data-testid={`connect-${platform.id}`}
                >
                  Connect
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
