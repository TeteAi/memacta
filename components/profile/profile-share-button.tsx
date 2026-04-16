"use client";

import { useState } from "react";

export default function ProfileShareButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/u/${username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silent fail
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
    >
      {copied ? "Copied!" : "Share profile"}
    </button>
  );
}
