"use client";

import { MIXED_MEDIA_STYLES } from "@/lib/mixed-media";

interface GenerateButtonProps {
  selectedStyleIds: string[];
  subjectPrompt: string;
  mediaType: "image" | "video";
  variationsPerBlend: number;
  isGenerating: boolean;
  isIncompatible: boolean;
  onClick: () => void;
}

export default function GenerateButton({
  selectedStyleIds,
  subjectPrompt,
  mediaType,
  variationsPerBlend,
  isGenerating,
  isIncompatible,
  onClick,
}: GenerateButtonProps) {
  const creditsPerGeneration = mediaType === "video" ? 9 : 3;
  const blendCount = selectedStyleIds.length >= 2 ? 1 : 0;
  const totalCost = blendCount * variationsPerBlend * creditsPerGeneration;

  const canGenerate =
    !isGenerating &&
    !isIncompatible &&
    selectedStyleIds.length >= 2 &&
    subjectPrompt.trim().length > 0;

  const incompatibleNames = selectedStyleIds
    .map((id) => MIXED_MEDIA_STYLES.find((s) => s.id === id))
    .filter((s) => s && !s.compatibleMedia.includes(mediaType))
    .map((s) => s!.name);

  return (
    <div className="space-y-3">
      {isIncompatible && incompatibleNames.length > 0 && (
        <p className="text-sm text-red-400">
          {incompatibleNames.join(", ")} {incompatibleNames.length === 1 ? "is" : "are"} not compatible with{" "}
          {mediaType} output.
        </p>
      )}
      {selectedStyleIds.length >= 2 && (
        <p className="text-sm text-white/50">
          {blendCount} blend &times; {variationsPerBlend} variations = {blendCount * variationsPerBlend} generations ({totalCost} credits)
        </p>
      )}
      <button
        type="button"
        data-testid="generate-btn"
        disabled={!canGenerate}
        aria-label={
          isIncompatible
            ? "Some styles not compatible with selected media type"
            : canGenerate
            ? "Generate Blend Pack"
            : "Select at least 2 styles and enter a subject"
        }
        onClick={onClick}
        className="w-full py-3 rounded-xl text-white font-bold text-base glow-btn disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-gradient-to-r from-fuchsia-500 to-purple-600"
      >
        {isGenerating ? "Generating…" : "Generate Blend Pack"}
      </button>
    </div>
  );
}
