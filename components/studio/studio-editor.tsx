"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Timeline, { type Clip } from "./timeline";
import ClipAdder from "./clip-adder";

type Props = {
  projectId?: string;
  initialName?: string;
  initialClips?: Clip[];
};

export default function StudioEditor({ projectId, initialName = "", initialClips = [] }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function addClip(clip: Clip) {
    setClips((c) => [...c, { ...clip, order: c.length }]);
  }

  function deleteClip(id: string) {
    setClips((c) => c.filter((x) => x.id !== id));
  }

  function moveClip(id: string, direction: "up" | "down") {
    setClips((c) => {
      const sorted = [...c].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((x) => x.id === id);
      if (idx === -1) return c;
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= sorted.length) return c;
      const next = [...sorted];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((x, i) => ({ ...x, order: i }));
    });
  }

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      const url = projectId ? `/api/projects/${projectId}` : "/api/projects";
      const method = projectId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, clips }),
      });
      if (res.ok) {
        setSaved(true);
        const data = await res.json().catch(() => ({}));
        if (!projectId && data?.id) {
          router.push(`/studio/${data.id}`);
        }
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-white/50 font-medium">Project name</span>
        <input
          type="text"
          aria-label="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My cinema project"
          className="bg-[#1e1e32] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none"
        />
      </label>
      <Timeline clips={clips} onDelete={deleteClip} onMove={moveClip} />
      <ClipAdder onAdd={addClip} />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-brand-gradient text-white px-6 py-2.5 text-sm font-semibold disabled:opacity-40 glow-btn transition-all"
        >
          {saving ? "Saving..." : "Save Project"}
        </button>
        {saved && (
          <span data-testid="save-indicator" className="text-sm text-green-400">
            Saved
          </span>
        )}
      </div>
    </div>
  );
}
