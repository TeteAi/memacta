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
      <span className="text-white/70 text-sm font-medium">Model</span>
      <select
        className="bg-[#1e1e32] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none appearance-none cursor-pointer"
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
