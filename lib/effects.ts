export type EffectCategory = "effect" | "template";

export interface Effect {
  id: string;
  name: string;
  thumbnail: string;
  prompt: string;
  category: EffectCategory;
}

export const EFFECTS: Effect[] = [
  { id: "on-fire", name: "On Fire", thumbnail: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=300&q=80", prompt: "Subject engulfed in cinematic flames, sparks rising", category: "effect" },
  { id: "skibidi", name: "Skibidi", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&q=80", prompt: "Subject in a skibidi-style surreal meme scene", category: "template" },
  { id: "mukbang", name: "Mukbang", thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=80", prompt: "Subject hosting an exaggerated mukbang feast", category: "template" },
  { id: "cloud-surf", name: "Cloud Surf", thumbnail: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=300&q=80", prompt: "Subject surfing on a wave of clouds above the sky", category: "effect" },
  { id: "idol", name: "Idol", thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80", prompt: "Subject on stage as a pop idol under spotlights", category: "template" },
  { id: "crystal-shatter", name: "Crystal Shatter", thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=80", prompt: "Subject shattering into crystalline shards", category: "effect" },
  { id: "liquid-metal", name: "Liquid Metal", thumbnail: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=300&q=80", prompt: "Subject morphing into flowing liquid metal", category: "effect" },
  { id: "neon-glow", name: "Neon Glow", thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?w=300&q=80", prompt: "Subject outlined with vibrant neon glow trails", category: "effect" },
  { id: "bullet-time", name: "Bullet Time", thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=300&q=80", prompt: "Subject frozen in bullet-time with camera arcing around", category: "template" },
  { id: "explosion", name: "Explosion", thumbnail: "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=300&q=80", prompt: "Massive explosion behind the subject in slow motion", category: "effect" },
  { id: "lightning-strike", name: "Lightning Strike", thumbnail: "https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?w=300&q=80", prompt: "Lightning bolt striking near the subject dramatically", category: "effect" },
  { id: "sand-dissolve", name: "Sand Dissolve", thumbnail: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=300&q=80", prompt: "Subject dissolving gracefully into grains of sand", category: "effect" },
  { id: "paper-fold", name: "Paper Fold", thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&q=80", prompt: "Scene folds like origami paper revealing subject", category: "effect" },
  { id: "comic-pop", name: "Comic Pop", thumbnail: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&q=80", prompt: "Subject rendered as a pop-art comic book panel", category: "template" },
  { id: "underwater", name: "Underwater", thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&q=80", prompt: "Subject submerged underwater with light rays and bubbles", category: "effect" },
  { id: "time-freeze", name: "Time Freeze", thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80", prompt: "Time freezes around the subject, particles suspended", category: "effect" },
  { id: "zoom-burst", name: "Zoom Burst", thumbnail: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=300&q=80", prompt: "Rapid zoom burst toward the subject with motion blur", category: "effect" },
  { id: "ghost-trail", name: "Ghost Trail", thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=300&q=80", prompt: "Subject leaves ethereal ghost trails as they move", category: "effect" },
  { id: "disintegrate", name: "Disintegrate", thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300&q=80", prompt: "Subject disintegrating into floating particles", category: "effect" },
  { id: "origami-fold", name: "Origami Fold", thumbnail: "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=300&q=80", prompt: "Subject folding into an origami figure", category: "effect" },
];

export function getEffectById(id: string): Effect | undefined {
  return EFFECTS.find((e) => e.id === id);
}
