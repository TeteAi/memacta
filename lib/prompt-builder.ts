// Pure helper module — no React, no network calls.

export const PROMPT_CATEGORIES = ["video", "image", "character"] as const;
export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];

export const STYLE_OPTIONS = [
  "cinematic",
  "photoreal",
  "anime",
  "oil painting",
  "3D render",
] as const;

export const LIGHTING_OPTIONS = [
  "golden hour",
  "neon glow",
  "soft studio",
  "volumetric fog",
] as const;

export const CAMERA_OPTIONS = [
  "close-up",
  "wide angle",
  "bird's eye",
  "tracking shot",
  "dolly zoom",
] as const;

export const MOTION_OPTIONS = [
  "slow motion",
  "timelapse",
  "panning left",
  "orbiting",
] as const;

export const MOOD_OPTIONS = [
  "ethereal",
  "dramatic",
  "peaceful",
  "mysterious",
  "nostalgic",
] as const;

export type PromptField =
  | "subject"
  | "style"
  | "lighting"
  | "camera"
  | "motion"
  | "mood";

export const CATEGORY_FIELDS: Record<PromptCategory, PromptField[]> = {
  video: ["subject", "style", "lighting", "camera", "motion", "mood"],
  image: ["subject", "style", "lighting", "camera", "mood"],
  character: ["subject", "style", "lighting", "mood"],
};

export interface PromptInputs {
  subject?: string;
  style?: string;
  lighting?: string;
  camera?: string;
  motion?: string;
  mood?: string;
}

export function composePrompt(
  inputs: PromptInputs,
  category: PromptCategory
): string {
  const fields = CATEGORY_FIELDS[category];
  const parts: string[] = [];

  const subject = (inputs.subject ?? "").trim();
  if (!subject) return "";

  const mappings: Record<PromptField, string | undefined> = {
    subject,
    style: inputs.style,
    lighting: inputs.lighting,
    camera: inputs.camera,
    motion: inputs.motion,
    mood: inputs.mood,
  };

  for (const field of fields) {
    const val = mappings[field];
    if (val && val.trim()) {
      parts.push(val.trim());
    }
  }

  return parts.join(", ");
}
