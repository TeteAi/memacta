"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

const CONFIRM_WORD = "delete";

/**
 * Self-service "delete my account" card. Requires the user to type
 * `delete` into the confirm field — mirrors the GitHub/Stripe convention
 * so nobody rage-clicks their way out of their data by accident.
 *
 * On success we NextAuth-signOut (which also clears their cookies) and
 * bounce to home with a flash param so the page can show a confirmation.
 */
export default function DangerZone() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (confirm.trim().toLowerCase() !== CONFIRM_WORD) {
      setError(`Type "${CONFIRM_WORD}" to confirm`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || data?.error || "Couldn't delete account");
        setBusy(false);
        return;
      }
      // NextAuth's client signOut clears the session cookie client-side and
      // redirects. We point it at home with a flag so we can show a toast.
      await signOut({ callbackUrl: "/?deleted=1" });
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-red-500/25 bg-red-500/5 p-6">
      <h2 className="text-lg font-bold text-red-300 mb-2">Danger zone</h2>
      <p className="text-sm text-white/60 mb-4">
        Deleting your account removes your profile, generations, characters,
        projects, credits, purchase history, and connected social accounts.
        Community posts you&apos;ve shared publicly will stay in the gallery
        but become anonymous. This cannot be undone.
      </p>

      {!open ? (
        <button
          type="button"
          data-testid="danger-open-btn"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-sm font-medium px-4 py-2 transition-colors"
        >
          Delete my account
        </button>
      ) : (
        <div className="space-y-3">
          <label className="block text-xs text-white/70">
            Type <span className="font-mono font-bold text-red-300">{CONFIRM_WORD}</span>{" "}
            to confirm:
          </label>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            data-testid="danger-confirm-input"
            className="w-full rounded-xl border border-white/15 bg-[#1e1e32] px-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 outline-none"
            placeholder={CONFIRM_WORD}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              data-testid="danger-delete-btn"
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? "Deleting…" : "Permanently delete"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirm("");
                setError(null);
              }}
              disabled={busy}
              className="text-sm text-white/60 hover:text-white transition-colors px-3 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
