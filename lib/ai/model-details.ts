import { FAL_ENDPOINTS } from "./fal-provider";

export type ModelDetails = {
  id: string;
  tagline: string;
  pitch: string;
  strengths: string[];
  samplePrompts: string[];
  maxDurationSec?: number;
  supportedAspects: ("16:9" | "9:16" | "1:1")[];
  provider: "fal.ai";
  falEndpoint: string;
  relatedModelIds: string[];
};

export const MODEL_DETAILS: Record<string, ModelDetails> = {
  "kling-3": {
    id: "kling-3",
    tagline: "Next-generation cinematic video with stunning realism from Kuaishou.",
    pitch:
      "Kling 3 is Kuaishou's flagship cinematic video model, delivering high-fidelity motion and photorealistic scenes. It supports 16:9 and 9:16 aspect ratios with up to 10 seconds of output, making it ideal for creators who demand the very best visual quality.",
    strengths: [
      "Exceptional photorealism and fine detail",
      "Smooth, natural motion physics",
      "Complex multi-subject scene composition",
      "Consistent character appearance across frames",
      "Vivid cinematic lighting",
    ],
    samplePrompts: [
      "A woman walks through Tokyo neon-lit streets at dusk, slow motion, cinematic",
      "Aerial shot of a mountain valley at sunrise, mist rolling through the trees",
      "A surfer rides a massive wave at golden hour, slow-motion spray",
    ],
    maxDurationSec: 10,
    supportedAspects: ["16:9", "9:16"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["kling-3"],
    relatedModelIds: ["kling-25-turbo", "kling-o1", "veo-31"],
  },

  "kling-25-turbo": {
    id: "kling-25-turbo",
    tagline: "Ultra-fast video drafts at low latency — iterate without waiting.",
    pitch:
      "Kling 2.5 Turbo is the speed-optimised variant of the Kling line. It trades some realism headroom for dramatically lower latency, making it perfect for rapid ideation, storyboarding, or quick social clips. It generates 16:9 or 9:16 video in seconds.",
    strengths: [
      "Very fast generation, ideal for drafts",
      "Low cost per iteration",
      "Solid motion quality at speed",
      "Great for storyboarding workflows",
    ],
    samplePrompts: [
      "A quick product showcase of sneakers spinning on a white background",
      "Timelapse of storm clouds rolling over a city skyline",
      "A cat stretching on a sunny windowsill, candid style",
    ],
    maxDurationSec: 5,
    supportedAspects: ["16:9", "9:16"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["kling-25-turbo"],
    relatedModelIds: ["kling-3", "kling-o1", "wan-26"],
  },

  "kling-o1": {
    id: "kling-o1",
    tagline: "Reasoning-assisted motion planning for unprecedented coherence.",
    pitch:
      "Kling O1 integrates a reasoning pass into the video generation pipeline, allowing it to plan complex camera moves and multi-step actions before rendering. The result is unusually coherent long-form motion sequences that would trip up conventional models.",
    strengths: [
      "Chain-of-thought motion planning",
      "Complex action sequences handled well",
      "High temporal consistency",
      "Smooth camera trajectory execution",
    ],
    samplePrompts: [
      "A gymnast performs a perfect backflip on a beach, 4K slow motion",
      "A chef tosses a pizza in the air and catches it behind their back",
      "A dancer transitions through five styles in one continuous shot",
    ],
    maxDurationSec: 10,
    supportedAspects: ["16:9", "9:16"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["kling-o1"],
    relatedModelIds: ["kling-3", "kling-25-turbo", "sora-2"],
  },

  "sora-2": {
    id: "sora-2",
    tagline: "OpenAI's long-form narrative video model — Hollywood-quality scenes.",
    pitch:
      "Sora 2 is OpenAI's second-generation video model, capable of generating up to 10 seconds of photorealistic video from text. It excels at complex narrative sequences, accurate physics, and highly detailed environments. Supports 16:9 widescreen output.",
    strengths: [
      "Long-form narrative coherence",
      "Photoreal motion and lighting",
      "Complex multi-character scenes",
      "Accurate real-world physics",
      "Expressive cinematic camera language",
    ],
    samplePrompts: [
      "A woman walks through Tokyo neon-lit streets at dusk, rain reflecting neon signs",
      "Astronaut on a lunar surface at golden hour, Earth visible in the background",
      "A dragon soars through storm clouds over a medieval castle at night",
    ],
    maxDurationSec: 10,
    supportedAspects: ["16:9"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["sora-2"],
    relatedModelIds: ["veo-31", "kling-3", "wan-26"],
  },

  "veo-31": {
    id: "veo-31",
    tagline: "Google's latest photoreal video model with fast rendering.",
    pitch:
      "Veo 3.1 is Google DeepMind's fast variant of the Veo 3 family. It delivers photorealistic, temporally stable video with quick turnaround, making it ideal for creators who want Google-quality visuals without long wait times. Outputs in 16:9 landscape.",
    strengths: [
      "Photorealistic textures and lighting",
      "Fast generation speed",
      "Strong temporal stability",
      "Excellent landscape scene rendering",
      "Reliable prompt adherence",
    ],
    samplePrompts: [
      "A quiet mountain lake at dawn, mist rising from the water, drone shot",
      "Waves crashing on a rocky coastline at sunset, 4K cinematic",
      "A bustling Tokyo intersection at night, rain and neon reflections",
    ],
    maxDurationSec: 8,
    supportedAspects: ["16:9"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["veo-31"],
    relatedModelIds: ["veo-3", "sora-2", "kling-3"],
  },

  "veo-3": {
    id: "veo-3",
    tagline: "Google DeepMind's stable general-purpose video generation model.",
    pitch:
      "Veo 3 is the reliable workhorse of Google's video lineup. It produces stable, high-quality video across a wide range of subjects and styles, making it a strong choice for everyday creative tasks. Outputs 16:9 video up to 8 seconds long.",
    strengths: [
      "Consistent and stable output quality",
      "Wide subject and style range",
      "Good prompt adherence",
      "Natural motion and physics",
    ],
    samplePrompts: [
      "A family of elephants crossing a river at sunrise, wide angle",
      "A timelapse of clouds rolling over the Alps, dramatic sky",
      "Street food vendor in Vietnam making pho, cinematic close-up",
    ],
    maxDurationSec: 8,
    supportedAspects: ["16:9"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["veo-3"],
    relatedModelIds: ["veo-31", "sora-2", "minimax-hailuo"],
  },

  "wan-26": {
    id: "wan-26",
    tagline: "Open-weights cinematic model — powerful, portable, community-loved.",
    pitch:
      "Wan 2.6 is a state-of-the-art open-weights video generation model celebrated by the open-source community for its cinematic quality and flexibility. It handles a wide range of visual styles and is tuned for realistic motion across 16:9 scenes.",
    strengths: [
      "Open-weights transparency and flexibility",
      "Strong cinematic composition",
      "Broad style range",
      "Active community fine-tunes available",
    ],
    samplePrompts: [
      "A samurai stands at the edge of a cliff during a lightning storm",
      "A retrofuturist city at night, flying cars, neon signs, 1980s aesthetic",
      "A lone lighthouse against a stormy sea, waves crashing, dramatic sky",
    ],
    maxDurationSec: 5,
    supportedAspects: ["16:9"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["wan-26"],
    relatedModelIds: ["kling-3", "sora-2", "minimax-hailuo"],
  },

  "minimax-hailuo": {
    id: "minimax-hailuo",
    tagline: "Character-consistent scenes with MiniMax's Hailuo engine.",
    pitch:
      "MiniMax Hailuo 02 specialises in character consistency — keeping faces, outfits, and identities stable across the full clip. It's the go-to choice for narrative stories, character vignettes, and UGC content where person coherence is critical.",
    strengths: [
      "Best-in-class character consistency",
      "Stable face and identity across frames",
      "Great for narrative story clips",
      "Strong dialogue/action scene handling",
    ],
    samplePrompts: [
      "A young woman in a red dress walks through a Parisian market, smiling",
      "Two friends laugh and toast at an outdoor café in Barcelona",
      "A detective examines a crime scene in a dimly lit 1940s office",
    ],
    maxDurationSec: 6,
    supportedAspects: ["16:9", "9:16"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["minimax-hailuo"],
    relatedModelIds: ["kling-3", "veo-3", "wan-26"],
  },

  "seedance-20": {
    id: "seedance-20",
    tagline: "ByteDance's dance and motion specialist — fluid movement, every time.",
    pitch:
      "Seedance 2.0 is ByteDance's model optimised for dance, physical motion, and human body articulation. It handles complex choreography and athletic movements with remarkable smoothness, outputting vertical 9:16 video ideal for social platforms.",
    strengths: [
      "Superior dance and choreography rendering",
      "Accurate human body articulation",
      "Smooth motion flow",
      "Ideal 9:16 vertical format for social",
    ],
    samplePrompts: [
      "A dancer performs hip-hop choreography in a neon-lit studio, vertical format",
      "A gymnast executes a perfect floor routine, slow motion 9:16",
      "Two people tango on a rooftop at sunset, cinematic vertical shot",
    ],
    maxDurationSec: 5,
    supportedAspects: ["9:16"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["seedance-20"],
    relatedModelIds: ["seedance-pro", "kling-3", "minimax-hailuo"],
  },

  "seedance-pro": {
    id: "seedance-pro",
    tagline: "Pro-grade dance and motion with higher fidelity from ByteDance.",
    pitch:
      "Seedance Pro is the premium tier of ByteDance's motion-specialist lineup. It uses higher compute budgets to deliver finer detail in clothing, hair, and environment during dynamic motion, producing professional broadcast-quality vertical video content.",
    strengths: [
      "Professional-quality motion rendering",
      "Superior clothing and hair simulation",
      "High temporal consistency at full resolution",
      "Better scene background stability",
      "Suitable for commercial content",
    ],
    samplePrompts: [
      "A K-pop idol performs a complex group routine on a concert stage, 4K",
      "A ballet dancer leaps across a grand theatre stage, dramatic lighting",
      "A breakdancer does windmills in a graffiti-covered underground spot",
    ],
    maxDurationSec: 5,
    supportedAspects: ["9:16"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["seedance-pro"],
    relatedModelIds: ["seedance-20", "kling-3", "minimax-hailuo"],
  },

  "soul-v2": {
    id: "soul-v2",
    tagline: "Stylized portrait generation with Soul's signature aesthetic.",
    pitch:
      "Soul v2 is a specialised image model fine-tuned on stylized portrait photography. It renders faces with striking artistic detail, applying moody lighting, depth, and unique colour grading that gives every portrait a distinctive, editorial look.",
    strengths: [
      "Striking stylized portrait quality",
      "Moody editorial colour grading",
      "Consistent face rendering",
      "Unique artistic aesthetic",
    ],
    samplePrompts: [
      "A close-up portrait of a woman with iridescent freckles, editorial style",
      "A young man in streetwear against a neon-lit wall, dramatic shadows",
      "A solitary figure in a fog-filled forest, ethereal light, painterly",
    ],
    supportedAspects: ["1:1"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["soul-v2"],
    relatedModelIds: ["nano-banana-pro", "flux-kontext", "gpt-image-15"],
  },

  "nano-banana-pro": {
    id: "nano-banana-pro",
    tagline: "Pro photoreal image generation with Nano Banana's premium pipeline.",
    pitch:
      "Nano Banana Pro is the premium tier of the Nano Banana image family, offering exceptional photorealistic quality with rich detail, accurate lighting, and true-to-life textures. It's ideal for product photography, portraits, and high-end visual content.",
    strengths: [
      "Best-in-class photorealistic quality",
      "Rich detail and accurate textures",
      "Excellent product and lifestyle photography",
      "Strong lighting simulation",
    ],
    samplePrompts: [
      "A luxury wristwatch on a marble surface, studio lighting, 8K macro",
      "A bowl of ramen photographed overhead, steam rising, warm ambient light",
      "A woman in a white blazer in a minimalist office, professional headshot",
    ],
    supportedAspects: ["1:1"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["nano-banana-pro"],
    relatedModelIds: ["nano-banana-2", "flux-2", "gpt-image-15"],
  },

  "nano-banana-2": {
    id: "nano-banana-2",
    tagline: "Fast, general-purpose image generation for rapid creative iteration.",
    pitch:
      "Nano Banana 2 is the swift general-purpose sibling in the Nano Banana family. It trades some of the Pro's realism ceiling for a significant speed boost, making it perfect for rapid prototyping, mood boards, and high-volume creative workflows.",
    strengths: [
      "Fast generation for quick iteration",
      "Reliable general image quality",
      "Wide style range",
      "Low cost per generation",
    ],
    samplePrompts: [
      "A vibrant tropical bird perched on a branch, watercolor style",
      "A sci-fi cityscape at night, neon and holograms, wide angle",
      "Abstract fluid art with purple and gold tones, 4K",
    ],
    supportedAspects: ["1:1"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["nano-banana-2"],
    relatedModelIds: ["nano-banana-pro", "flux-2", "wan-25-image"],
  },

  "wan-25-image": {
    id: "wan-25-image",
    tagline: "Open-weights image generation — Wan's proven quality for static art.",
    pitch:
      "Wan 2.5 Image brings the open-weights philosophy to static image generation. It inherits the cinematic composition sensibility from the Wan video line and applies it to single-frame outputs, producing richly detailed, stylistically flexible images.",
    strengths: [
      "Open-weights flexibility",
      "Cinematic composition sense",
      "Strong landscape and environment rendering",
      "Active community fine-tunes",
    ],
    samplePrompts: [
      "A misty ancient temple deep in a bamboo forest, dawn light rays",
      "A crystal-clear lake reflecting snow-capped mountains at sunrise",
      "A futuristic samurai standing in a rainy Tokyo street, neon reflections",
    ],
    supportedAspects: ["1:1"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["wan-25-image"],
    relatedModelIds: ["flux-2", "nano-banana-pro", "seedream-4"],
  },

  "seedream-4": {
    id: "seedream-4",
    tagline: "Dreamlike surreal imagery from ByteDance's Seedream engine.",
    pitch:
      "Seedream 4 is ByteDance's image model tuned for surreal, dreamlike, and fantasy visuals. It excels at blending real and imaginary elements with a signature soft, otherworldly aesthetic that makes every image feel like a scene from a dream.",
    strengths: [
      "Surreal and dreamlike visual style",
      "Excellent fantasy world-building",
      "Soft, painterly lighting",
      "Unique blend of real and imaginary elements",
    ],
    samplePrompts: [
      "A giant glowing jellyfish floating through clouds above a sunset city",
      "An enchanted library where books fly and candles float in the air",
      "A whale swimming through a starry night sky above a sleeping village",
    ],
    supportedAspects: ["1:1"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["seedream-4"],
    relatedModelIds: ["soul-v2", "flux-2", "wan-25-image"],
  },

  "gpt-image-15": {
    id: "gpt-image-15",
    tagline: "OpenAI's instructable image model — edit and generate via natural language.",
    pitch:
      "GPT Image 1.5 is OpenAI's latest image model, designed for precise instruction-following and iterative editing. Describe complex scenes, request specific changes, and guide the output with natural language to get exactly what you envision.",
    strengths: [
      "Best-in-class instruction following",
      "Natural language image editing",
      "Strong text rendering within images",
      "Iterative refinement support",
      "Wide style versatility",
    ],
    samplePrompts: [
      "A cozy coffee shop interior with wooden tables, warm lighting, and a large window showing rain outside",
      "A vintage travel poster for Mars with retro fonts and a rocket ship, 1960s style",
      "A minimalist logo for a tech startup called 'Nova', blue and white, clean sans-serif",
    ],
    supportedAspects: ["1:1"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["gpt-image-15"],
    relatedModelIds: ["flux-kontext", "nano-banana-pro", "flux-2"],
  },

  "flux-kontext": {
    id: "flux-kontext",
    tagline: "Context-aware image editing that understands your visual intent.",
    pitch:
      "Flux Kontext is Black Forest Labs' context-aware editing model. It reads your image and prompt together, making targeted modifications while preserving the surrounding context. Perfect for replacing objects, changing styles, or refining existing images.",
    strengths: [
      "Intelligent context-aware editing",
      "Preserves image context during edits",
      "Strong object replacement and swap",
      "Accurate style transfer",
    ],
    samplePrompts: [
      "Change the car in this photo from red to midnight blue and add rain reflections",
      "Replace the background with a sunset beach while keeping the subject sharp",
      "Add a glowing neon sign in Japanese to the brick wall behind the subject",
    ],
    supportedAspects: ["1:1"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["flux-kontext"],
    relatedModelIds: ["flux-2", "gpt-image-15", "nano-banana-pro"],
  },

  "flux-2": {
    id: "flux-2",
    tagline: "Black Forest Labs' high-quality general image model — new and sharp.",
    pitch:
      "Flux 2 is the latest generation from Black Forest Labs, delivering high-quality general-purpose image generation with crisp detail, accurate anatomy, and broad style support. The go-to choice when you want exceptional results without specialisation constraints.",
    strengths: [
      "Exceptional sharpness and detail",
      "Accurate human anatomy",
      "Broad style range",
      "Strong text-in-image rendering",
      "Reliable prompt adherence",
    ],
    samplePrompts: [
      "A photorealistic portrait of a woman with flowers in her hair, golden hour light",
      "An ultra-detailed illustration of a cyberpunk alley, rain, neon, 8K",
      "A majestic lion in an African savanna at sunset, National Geographic style",
    ],
    supportedAspects: ["1:1"],
    provider: "fal.ai",
    falEndpoint: FAL_ENDPOINTS["flux-2"],
    relatedModelIds: ["flux-kontext", "nano-banana-pro", "gpt-image-15"],
  },
};
