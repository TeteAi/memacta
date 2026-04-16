"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  userId: string | null;
  createdAt: string;
};

const STATUS_OPTIONS = ["new", "read", "handled", "spam"] as const;

// Single row in the contact-message triage list. Shows the full body
// inline (no modal — messages are short) and a status dropdown that
// PATCHes /api/admin/messages/[id] and refreshes the page to pick up
// the updated counts. Keeps the UI cheap — no fancy state mgmt needed
// since the dataset is small.

export default function MessageRow({ message }: { message: Message }) {
  const router = useRouter();
  const [status, setStatus] = useState(message.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(next: string) {
    const previous = status;
    setStatus(next);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/messages/${message.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setStatus(previous);
        setError("Save failed.");
      } else {
        router.refresh();
      }
    } catch {
      setStatus(previous);
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  const created = new Date(message.createdAt).toLocaleString();

  return (
    <div className="rounded-xl border border-white/15 bg-[#181828] p-4">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white">{message.name}</span>
            <span className="text-sm text-white/50">&lt;{message.email}&gt;</span>
            {message.userId && (
              <span className="text-xs rounded-full bg-cyan-500/20 text-cyan-300 px-2 py-0.5">
                signed-in
              </span>
            )}
          </div>
          <div className="text-xs text-white/40 mt-0.5">{created}</div>
        </div>
        <select
          value={status}
          onChange={(e) => updateStatus(e.target.value)}
          disabled={saving}
          className="text-xs rounded-lg bg-white/10 border border-white/20 px-2 py-1 text-white disabled:opacity-60"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      {message.subject && (
        <div className="text-sm font-medium text-brand-cyan mb-1">
          {message.subject}
        </div>
      )}
      <p className="text-sm text-white/80 whitespace-pre-wrap break-words">
        {message.message}
      </p>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
