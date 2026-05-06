"use client";

import { useEffect, useId, useRef, useState } from "react";
import Script from "next/script";

/**
 * Cloudflare Turnstile widget.
 *
 * Renders a single managed challenge inside the parent form. When the user
 * solves it, `onToken` fires with the response token; the parent submits it
 * alongside the rest of the form. When the token expires (Turnstile resets
 * it automatically every ~5 min), `onToken(null)` fires so the parent can
 * re-disable the submit button.
 *
 * If `NEXT_PUBLIC_TURNSTILE_SITE_KEY` isn't configured we render nothing and
 * fire `onToken(null)` once — letting the parent decide whether to gate
 * submit. Pairs with lib/turnstile.ts which skips siteverify when the
 * server-side key is missing too, so dev / preview deploys without the
 * keys still work end-to-end.
 *
 * Theme: `dark` matches memacta's dark shell; size: `flexible` shrinks to
 * narrow phone widths cleanly.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement | string,
        opts: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "flexible" | "compact" | "invisible";
          appearance?: "always" | "execute" | "interaction-only";
          callback: (token: string) => void;
          "error-callback"?: (err?: string) => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type Props = {
  onToken: (token: string | null) => void;
  /** Show a small "verifying" line below the widget while it's loading. */
  showStatus?: boolean;
  className?: string;
};

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

export default function TurnstileWidget({ onToken, showStatus, className }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No site key → tell the parent we're not gating, render nothing. Lets
  // local development run without Cloudflare credentials.
  useEffect(() => {
    if (!siteKey) {
      onToken(null);
    }
  }, [siteKey, onToken]);

  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current) return;
    if (!window.turnstile) return;

    // Render once; remove on unmount so React Strict Mode double-renders
    // don't stack two challenges.
    const id = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "dark",
      size: "flexible",
      callback: (token) => {
        setError(null);
        onToken(token);
      },
      "error-callback": (err) => {
        setError(err ?? "challenge_failed");
        onToken(null);
      },
      "expired-callback": () => {
        onToken(null);
      },
      "timeout-callback": () => {
        setError("challenge_timeout");
        onToken(null);
      },
    });
    widgetIdRef.current = id;

    return () => {
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* widget may already be gone if the script was unloaded */
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, scriptReady, onToken]);

  if (!siteKey) return null;

  return (
    <div className={className}>
      <Script
        src={SCRIPT_SRC}
        strategy="lazyOnload"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />
      <div ref={containerRef} id={`ts-${containerId}`} className="cf-turnstile" />
      {showStatus && !scriptReady && (
        <p className="text-[11px] text-white/30 mt-1.5">Loading verification…</p>
      )}
      {error && (
        <p className="text-[11px] text-red-400 mt-1.5">
          Verification failed. Reload the page to try again.
        </p>
      )}
    </div>
  );
}
