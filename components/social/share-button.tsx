"use client";

import { useState, useEffect } from "react";
import ShareModal from "./share-modal";

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
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all"
        data-testid="share-button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>
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
