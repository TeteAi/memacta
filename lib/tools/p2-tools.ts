export type ToolInputType = "image" | "text" | "prompt";

export interface ToolInput {
  key: string;
  label: string;
  type: ToolInputType;
}

export interface ToolDef {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: "identity" | "editing";
  inputs: ToolInput[];
  mediaOut: "image" | "video";
}

export const P2_TOOLS: ToolDef[] = [
  {
    id: "soul-id",
    slug: "soul-id",
    name: "Soul ID",
    description: "Lock in a consistent character from up to 4 reference shots.",
    category: "identity",
    mediaOut: "image",
    inputs: [
      { key: "ref1", label: "Reference 1", type: "image" },
      { key: "ref2", label: "Reference 2", type: "image" },
      { key: "ref3", label: "Reference 3", type: "image" },
      { key: "ref4", label: "Reference 4", type: "image" },
      { key: "name", label: "Character name", type: "text" },
    ],
  },
  {
    id: "soul-moodboard",
    slug: "soul-moodboard",
    name: "Soul Moodboard",
    description: "Blend up to 6 references into a single stylized shot.",
    category: "identity",
    mediaOut: "image",
    inputs: [
      { key: "ref1", label: "Image 1", type: "image" },
      { key: "ref2", label: "Image 2", type: "image" },
      { key: "ref3", label: "Image 3", type: "image" },
      { key: "ref4", label: "Image 4", type: "image" },
      { key: "ref5", label: "Image 5", type: "image" },
      { key: "ref6", label: "Image 6", type: "image" },
      { key: "prompt", label: "Prompt", type: "prompt" },
    ],
  },
  {
    id: "character-swap-2",
    slug: "character-swap-2",
    name: "Character Swap 2",
    description: "Swap a character into a target video with a guiding prompt.",
    category: "identity",
    mediaOut: "video",
    inputs: [
      { key: "source", label: "Source character", type: "image" },
      { key: "target", label: "Target scene", type: "image" },
      { key: "prompt", label: "Prompt", type: "prompt" },
    ],
  },
  {
    id: "face-swap",
    slug: "face-swap",
    name: "Face Swap",
    description: "Swap a face from a source image onto a target image.",
    category: "identity",
    mediaOut: "image",
    inputs: [
      { key: "source", label: "Source face", type: "image" },
      { key: "target", label: "Target image", type: "image" },
    ],
  },
  {
    id: "video-face-swap",
    slug: "video-face-swap",
    name: "Video Face Swap",
    description: "Swap a face onto every frame of a target video.",
    category: "identity",
    mediaOut: "video",
    inputs: [
      { key: "source", label: "Source face", type: "image" },
      { key: "target", label: "Target video URL", type: "text" },
    ],
  },
  {
    id: "outfit-swap",
    slug: "outfit-swap",
    name: "Outfit Swap",
    description: "Dress a person in an outfit from a reference image.",
    category: "identity",
    mediaOut: "image",
    inputs: [
      { key: "person", label: "Person", type: "image" },
      { key: "outfit", label: "Outfit", type: "image" },
      { key: "prompt", label: "Prompt", type: "prompt" },
    ],
  },
  {
    id: "photodump",
    slug: "photodump",
    name: "Photodump",
    description: "Turn one photo into a casual photodump-style shot.",
    category: "identity",
    mediaOut: "image",
    inputs: [
      { key: "image", label: "Photo", type: "image" },
      { key: "prompt", label: "Prompt", type: "prompt" },
    ],
  },
  {
    id: "soul-cast",
    slug: "soul-cast",
    name: "Soul Cast",
    description: "Cast a locked character into a new scene.",
    category: "identity",
    mediaOut: "image",
    inputs: [
      { key: "character", label: "Character", type: "image" },
      { key: "prompt", label: "Prompt", type: "prompt" },
    ],
  },
  {
    id: "ai-influencer",
    slug: "ai-influencer",
    name: "AI Influencer",
    description: "Create a complete AI influencer with custom appearance, personality, and style. Generate consistent characters for social media content.",
    category: "identity",
    mediaOut: "image",
    inputs: [{ key: "prompt", label: "Prompt", type: "prompt" }],
  },
  {
    id: "fashion-factory",
    slug: "fashion-factory",
    name: "Fashion Factory",
    description: "Upload one person + up to 6 outfit references and generate a full styled lookbook in one click.",
    category: "identity",
    mediaOut: "image",
    inputs: [
      { key: "person", label: "Person", type: "image" },
      { key: "outfit1", label: "Outfit 1", type: "image" },
      { key: "outfit2", label: "Outfit 2", type: "image" },
      { key: "outfit3", label: "Outfit 3", type: "image" },
      { key: "prompt", label: "Style prompt", type: "prompt" },
    ],
  },
];

export function getToolBySlug(slug: string): ToolDef | undefined {
  return P2_TOOLS.find((t) => t.slug === slug);
}
