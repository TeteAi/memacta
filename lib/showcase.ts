export interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string;
  mediaType: "image" | "video";
  tool: string;
  creator: string;
  category:
    | "avatar"
    | "effect"
    | "cinematic"
    | "product"
    | "character"
    | "landscape"
    | "portrait";
}

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  // ─── Videos ───────────────────────────────────────────────
  {
    id: "vid-neon-abstract",
    title: "Neon Pulse",
    description: "Abstract neon light trails flowing through darkness",
    mediaUrl:
      "https://videos.pexels.com/video-files/3571264/3571264-sd_640_360_30fps.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=640&q=80",
    mediaType: "video",
    tool: "Kling 3.0",
    creator: "NeonCreator",
    category: "effect",
  },
  {
    id: "vid-city-timelapse",
    title: "City Never Sleeps",
    description: "Timelapse of a bustling city skyline at dusk",
    mediaUrl:
      "https://videos.pexels.com/video-files/856116/856116-sd_640_360_25fps.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=640&q=80",
    mediaType: "video",
    tool: "Sora 2",
    creator: "UrbanLens",
    category: "cinematic",
  },
  {
    id: "vid-ocean-waves",
    title: "Tidal Dream",
    description: "Ocean waves crashing on golden shores at sunset",
    mediaUrl:
      "https://videos.pexels.com/video-files/2795173/2795173-sd_640_360_25fps.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=640&q=80",
    mediaType: "video",
    tool: "Veo 3.1",
    creator: "OceanicAI",
    category: "landscape",
  },
  {
    id: "vid-ink-water",
    title: "Ink Bloom",
    description: "Mesmerizing ink tendrils expanding through water",
    mediaUrl:
      "https://videos.pexels.com/video-files/4763824/4763824-sd_640_360_25fps.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640&q=80",
    mediaType: "video",
    tool: "Soul 2.0",
    creator: "ArtisanAI",
    category: "effect",
  },
  {
    id: "vid-northern-lights",
    title: "Aurora Borealis",
    description: "Dancing northern lights over a frozen landscape",
    mediaUrl:
      "https://videos.pexels.com/video-files/3129671/3129671-sd_640_360_30fps.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=640&q=80",
    mediaType: "video",
    tool: "Kling 3.0",
    creator: "PixelDreamer",
    category: "landscape",
  },
  {
    id: "vid-smoke-abstract",
    title: "Smoke Reverie",
    description: "Ethereal smoke patterns drifting in slow motion",
    mediaUrl:
      "https://videos.pexels.com/video-files/1093662/1093662-sd_640_360_30fps.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=640&q=80",
    mediaType: "video",
    tool: "Flux Kontext",
    creator: "MistForge",
    category: "effect",
  },
  {
    id: "vid-drone-landscape",
    title: "Skyward Drift",
    description: "Sweeping drone footage over emerald valleys",
    mediaUrl:
      "https://videos.pexels.com/video-files/5765206/5765206-sd_640_360_25fps.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=640&q=80",
    mediaType: "video",
    tool: "Veo 3.1",
    creator: "SkyCanvas",
    category: "cinematic",
  },
  {
    id: "vid-fire-closeup",
    title: "Ember Core",
    description: "Close-up flames dancing in ultra slow motion",
    mediaUrl:
      "https://videos.pexels.com/video-files/2491284/2491284-sd_640_360_24fps.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=640&q=80",
    mediaType: "video",
    tool: "Sora 2",
    creator: "PyroVision",
    category: "effect",
  },
  {
    id: "vid-rain-window",
    title: "Rain Meditation",
    description: "Raindrops tracing paths down a window pane",
    mediaUrl:
      "https://videos.pexels.com/video-files/2098989/2098989-sd_640_360_30fps.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1515694346937-94d85e39d29b?w=640&q=80",
    mediaType: "video",
    tool: "Soul 2.0",
    creator: "RainFrame",
    category: "cinematic",
  },
  {
    id: "vid-galaxy",
    title: "Cosmic Voyage",
    description: "Journey through a spiral galaxy in deep space",
    mediaUrl:
      "https://videos.pexels.com/video-files/4553620/4553620-sd_640_360_25fps.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&q=80",
    mediaType: "video",
    tool: "Kling 3.0",
    creator: "StarForgeAI",
    category: "landscape",
  },
  // ─── Images ───────────────────────────────────────────────
  {
    id: "img-neon-portrait",
    title: "Neon Gaze",
    description: "Portrait illuminated by vibrant neon light",
    mediaUrl:
      "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=320&q=80",
    mediaType: "image",
    tool: "Flux Kontext",
    creator: "NeonCreator",
    category: "portrait",
  },
  {
    id: "img-cyberpunk-city",
    title: "Neon District",
    description: "Cyberpunk cityscape dripping with neon rain",
    mediaUrl:
      "https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=320&q=80",
    mediaType: "image",
    tool: "Sora 2",
    creator: "CyberLens",
    category: "cinematic",
  },
  {
    id: "img-cat-portrait",
    title: "Feline Majesty",
    description: "Regal cat portrait with dramatic studio lighting",
    mediaUrl:
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=320&q=80",
    mediaType: "image",
    tool: "Character Swap 2.0",
    creator: "PetPixel",
    category: "character",
  },
  {
    id: "img-abstract-art",
    title: "Chromatic Waves",
    description: "Abstract color field with flowing organic shapes",
    mediaUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=320&q=80",
    mediaType: "image",
    tool: "Soul 2.0",
    creator: "ArtisanAI",
    category: "effect",
  },
  {
    id: "img-male-portrait",
    title: "Urban Character",
    description: "Stylized male portrait with cinematic color grade",
    mediaUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&q=80",
    mediaType: "image",
    tool: "Face Swap",
    creator: "PortraitPro",
    category: "portrait",
  },
  {
    id: "img-female-portrait",
    title: "Golden Hour",
    description: "Warm portrait bathed in golden hour sunlight",
    mediaUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=320&q=80",
    mediaType: "image",
    tool: "Character Swap 2.0",
    creator: "LightChaser",
    category: "portrait",
  },
  {
    id: "img-earth-space",
    title: "Pale Blue Dot",
    description: "Earth seen from orbit with city lights glowing",
    mediaUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=320&q=80",
    mediaType: "image",
    tool: "Veo 3.1",
    creator: "StarForgeAI",
    category: "landscape",
  },
  {
    id: "img-product-shot",
    title: "Minimal Studio",
    description: "Clean product photography on gradient backdrop",
    mediaUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=320&q=80",
    mediaType: "image",
    tool: "Flux Kontext",
    creator: "StudioShot",
    category: "product",
  },
  {
    id: "img-mountain-lake",
    title: "Mirror Lake",
    description: "Mountain range perfectly reflected in a still lake",
    mediaUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=320&q=80",
    mediaType: "image",
    tool: "Kling 3.0",
    creator: "NatureLens",
    category: "landscape",
  },
  {
    id: "img-abstract-fluid",
    title: "Liquid Chrome",
    description: "Metallic fluid simulation frozen in time",
    mediaUrl:
      "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=320&q=80",
    mediaType: "image",
    tool: "Soul 2.0",
    creator: "MistForge",
    category: "effect",
  },
  {
    id: "img-sunset-silhouette",
    title: "Silhouette Dreams",
    description: "Figure silhouetted against a blazing sunset",
    mediaUrl:
      "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=320&q=80",
    mediaType: "image",
    tool: "Sora 2",
    creator: "DuskFrame",
    category: "cinematic",
  },
  {
    id: "img-city-aerial",
    title: "Grid City",
    description: "Aerial view of illuminated city grid at night",
    mediaUrl:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=320&q=80",
    mediaType: "image",
    tool: "Veo 3.1",
    creator: "UrbanLens",
    category: "cinematic",
  },
  {
    id: "img-flower-macro",
    title: "Petal Detail",
    description: "Extreme macro of dew drops on flower petals",
    mediaUrl:
      "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=320&q=80",
    mediaType: "image",
    tool: "Flux Kontext",
    creator: "MacroMind",
    category: "product",
  },
  {
    id: "img-avatar-warrior",
    title: "Cyber Warrior",
    description: "AI-generated warrior avatar with glowing armor",
    mediaUrl:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=320&q=80",
    mediaType: "image",
    tool: "Character Swap 2.0",
    creator: "AvatarForge",
    category: "avatar",
  },
  {
    id: "img-northern-glow",
    title: "Arctic Shimmer",
    description: "Northern lights painting the sky in green and purple",
    mediaUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=320&q=80",
    mediaType: "image",
    tool: "Kling 3.0",
    creator: "PixelDreamer",
    category: "landscape",
  },
  {
    id: "img-robot-portrait",
    title: "Synthetic Mind",
    description: "Photorealistic robot face with human-like expression",
    mediaUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=320&q=80",
    mediaType: "image",
    tool: "Face Swap",
    creator: "SynthLab",
    category: "character",
  },
  {
    id: "img-desert-dunes",
    title: "Saharan Flow",
    description: "Windswept sand dunes under a crimson sky",
    mediaUrl:
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=320&q=80",
    mediaType: "image",
    tool: "Veo 3.1",
    creator: "TerrainAI",
    category: "landscape",
  },
  {
    id: "img-studio-model",
    title: "Fashion Forward",
    description: "High-fashion portrait with dramatic side lighting",
    mediaUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&q=80",
    mediaType: "image",
    tool: "Face Swap",
    creator: "VogueAI",
    category: "portrait",
  },
  {
    id: "img-circuit-board",
    title: "Digital Veins",
    description: "Glowing circuit board pathways in macro detail",
    mediaUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=320&q=80",
    mediaType: "image",
    tool: "Soul 2.0",
    creator: "TechViz",
    category: "product",
  },
  {
    id: "img-underwater-reef",
    title: "Reef World",
    description: "Vibrant coral reef teeming with tropical fish",
    mediaUrl:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=320&q=80",
    mediaType: "image",
    tool: "Kling 3.0",
    creator: "OceanicAI",
    category: "landscape",
  },
  {
    id: "img-neon-sign",
    title: "After Hours",
    description: "Glowing neon sign reflected on rain-slicked street",
    mediaUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=320&q=80",
    mediaType: "image",
    tool: "Flux Kontext",
    creator: "NeonCreator",
    category: "cinematic",
  },
  {
    id: "img-galaxy-core",
    title: "Galaxy Core",
    description: "Dense star field at the heart of a spiral galaxy",
    mediaUrl:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=320&q=80",
    mediaType: "image",
    tool: "Sora 2",
    creator: "StarForgeAI",
    category: "landscape",
  },
  {
    id: "img-smoke-portrait",
    title: "Smoke Veil",
    description: "Portrait shrouded in wisps of colorful smoke",
    mediaUrl:
      "https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=320&q=80",
    mediaType: "image",
    tool: "Character Swap 2.0",
    creator: "MistForge",
    category: "portrait",
  },
  {
    id: "img-vintage-car",
    title: "Chrome Classic",
    description: "Vintage car detail shot with rich color grading",
    mediaUrl:
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=320&q=80",
    mediaType: "image",
    tool: "Veo 3.1",
    creator: "RetroVision",
    category: "product",
  },
  {
    id: "img-ice-cave",
    title: "Frozen Cathedral",
    description: "Inside an ice cave with crystalline blue walls",
    mediaUrl:
      "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=320&q=80",
    mediaType: "image",
    tool: "Kling 3.0",
    creator: "TerrainAI",
    category: "landscape",
  },
  {
    id: "img-avatar-cyberpunk",
    title: "Neon Runner",
    description: "Cyberpunk character avatar with holographic visor",
    mediaUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=320&q=80",
    mediaType: "image",
    tool: "Character Swap 2.0",
    creator: "AvatarForge",
    category: "avatar",
  },
  {
    id: "img-lightning-storm",
    title: "Electric Sky",
    description: "Multiple lightning bolts splitting a dark sky",
    mediaUrl:
      "https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?w=320&q=80",
    mediaType: "image",
    tool: "Soul 2.0",
    creator: "StormChaser",
    category: "effect",
  },
  {
    id: "img-paint-splash",
    title: "Color Explosion",
    description: "Dynamic paint splash frozen mid-air",
    mediaUrl:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=320&q=80",
    mediaType: "image",
    tool: "Flux Kontext",
    creator: "ArtisanAI",
    category: "effect",
  },
  {
    id: "img-wolf-portrait",
    title: "Alpha Gaze",
    description: "Intense close-up portrait of a grey wolf",
    mediaUrl:
      "https://images.unsplash.com/photo-1516728043666-12698d2de804?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516728043666-12698d2de804?w=320&q=80",
    mediaType: "image",
    tool: "Character Swap 2.0",
    creator: "WildLens",
    category: "character",
  },
  {
    id: "img-glass-building",
    title: "Glass Monolith",
    description: "Modern glass skyscraper reflecting sunset clouds",
    mediaUrl:
      "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=320&q=80",
    mediaType: "image",
    tool: "Sora 2",
    creator: "UrbanLens",
    category: "cinematic",
  },
  {
    id: "img-avatar-fantasy",
    title: "Elven Sage",
    description: "Fantasy character avatar with elven features",
    mediaUrl:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=320&q=80",
    mediaType: "image",
    tool: "Character Swap 2.0",
    creator: "AvatarForge",
    category: "avatar",
  },
  {
    id: "img-bokeh-lights",
    title: "City Bokeh",
    description: "Dreamy bokeh lights from a city at night",
    mediaUrl:
      "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=640&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=320&q=80",
    mediaType: "image",
    tool: "Soul 2.0",
    creator: "LightChaser",
    category: "effect",
  },
];

export function getShowcaseByCategory(
  category: ShowcaseItem["category"],
): ShowcaseItem[] {
  return SHOWCASE_ITEMS.filter((item) => item.category === category);
}

export function getShowcaseByTool(tool: string): ShowcaseItem[] {
  return SHOWCASE_ITEMS.filter((item) => item.tool === tool);
}

export function getShowcaseVideos(): ShowcaseItem[] {
  return SHOWCASE_ITEMS.filter((item) => item.mediaType === "video");
}

export function getShowcaseImages(): ShowcaseItem[] {
  return SHOWCASE_ITEMS.filter((item) => item.mediaType === "image");
}
