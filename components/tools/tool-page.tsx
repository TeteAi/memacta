"use client";
import { useState } from "react";
import type { ToolDef } from "@/lib/tools/p2-tools";

export function ToolPage({ tool }: { tool: ToolDef }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) =>
    setValues((p) => ({ ...p, [k]: v }));

  async function onGenerate() {
    setLoading(true);
    setResult(null);
    const promptParts: string[] = [`[${tool.name}]`];
    for (const i of tool.inputs) {
      const v = values[i.key] ?? "";
      if (v) promptParts.push(`${i.label}: ${v}`);
    }
    const model = tool.mediaOut === "video" ? "kling-3" : "soul-v2";
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: promptParts.join(" | "),
        model,
        mediaType: tool.mediaOut,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setResult(data?.url ?? data?.result ?? "generated");
    setLoading(false);
  }

  return (
    <div data-testid="tool-page" className="space-y-4">
      <div className="space-y-3">
        {tool.inputs.map((i) => (
          <label key={i.key} className="block">
            <span className="block text-sm mb-1">{i.label}</span>
            {i.type === "prompt" ? (
              <textarea
                data-testid={`input-${i.key}`}
                className="w-full rounded border border-white/10 bg-black/40 p-2"
                value={values[i.key] ?? ""}
                onChange={(e) => update(i.key, e.target.value)}
              />
            ) : (
              <input
                data-testid={`input-${i.key}`}
                type="text"
                placeholder={i.type === "image" ? "https://..." : ""}
                className="w-full rounded border border-white/10 bg-black/40 p-2"
                value={values[i.key] ?? ""}
                onChange={(e) => update(i.key, e.target.value)}
              />
            )}
          </label>
        ))}
      </div>
      <button
        data-testid="generate-button"
        onClick={onGenerate}
        disabled={loading}
        className="rounded bg-white text-black px-4 py-2 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate"}
      </button>
      {result && (
        <div data-testid="tool-result" className="rounded border border-white/10 p-3">
          {result}
        </div>
      )}
    </div>
  );
}
