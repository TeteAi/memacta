"use client";

import { useState, useEffect } from "react";
import ShareModal from "./share-modal";
import { Button } from "@/components/ui/button";

type Props = {
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
};

type SocialAccountInfo = {
  id: string;
  platform: string;
  username: string | null;
};

export default function ShareButton({ mediaUrl, mediaType, caption }: Props) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<SocialAccountInfo[]>([]);

  useEffect(() => {
    if (open) {
      fetch("/api/social/accounts")
        .then((r) => r.json())
        .then((data) => setAccounts(data.accounts ?? []))
        .catch(() => setAccounts([]));
    }
  }, [open]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        data-testid="share-button"
      >
        Share
      </Button>
      {open && (
        <ShareModal
          mediaUrl={mediaUrl}
          mediaType={mediaType}
          caption={caption}
          connectedAccounts={accounts}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
