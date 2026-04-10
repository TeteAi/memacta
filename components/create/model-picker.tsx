"use client";

import { videoModels, imageModels } from "@/lib/ai/models";

type Props = {
  mediaType: "video" | "image";
  value: string;
  onChange: (id: string) => void;
};

export default function ModelPicker({ mediaType, value, onChange }: Props) {
  const models = mediaType === "video" ? videoModels() : imageModels();
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted-foreground">Model</span>
      <select
        className="bg-card border border-border rounded-lg px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
            {m.badge ? ` · ${m.badge}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
