export const CREDIT_COSTS: Record<string, { image: number; video: number }> = {
  // Budget Image
  "wan-25-image": { image: 3, video: 0 },
  "seedream-4": { image: 3, video: 0 },
  "flux-2": { image: 3, video: 0 },
  // Standard Image
  "flux-kontext": { image: 5, video: 0 },
  "gpt-image-15": { image: 5, video: 0 },
  "nano-banana-2": { image: 5, video: 0 },
  "soul-v2": { image: 5, video: 0 },
  // Premium Image
  "nano-banana-pro": { image: 10, video: 0 },
  // Budget Video
  "minimax-hailuo": { image: 0, video: 30 },
  "wan-26": { image: 0, video: 30 },
  "kling-25-turbo": { image: 0, video: 30 },
  // Standard Video
  "kling-3": { image: 0, video: 50 },
  "kling-o1": { image: 0, video: 50 },
  "seedance-20": { image: 0, video: 50 },
  // Premium Video
  "sora-2": { image: 0, video: 120 },
  "veo-31": { image: 0, video: 120 },
  "seedance-pro": { image: 0, video: 120 },
  // Ultra Video
  "veo-3": { image: 0, video: 250 },
};

export function getCreditCost(modelId: string, mediaType: "image" | "video"): number {
  const costs = CREDIT_COSTS[modelId];
  if (!costs) return mediaType === "video" ? 50 : 5;
  return mediaType === "video" ? costs.video : costs.image;
}

export interface Plan {
  id: string;
  name: string;
  price: number; // cents
  credits: number;
  dailyCredits: number;
  popular?: boolean;
  features: string[];
  approxGenerations: string;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    credits: 0,
    dailyCredits: 30,
    features: [
      "30 credits / day",
      "Watermarked output",
      "Community access",
      "Budget models only",
      "Standard queue",
    ],
    approxGenerations: "~10 images or ~1 video / day",
  },
  {
    id: "starter",
    name: "Starter",
    price: 999,
    credits: 300,
    dailyCredits: 0,
    features: [
      "300 credits / month",
      "No watermark",
      "Download enabled",
      "All image models",
      "Standard queue",
    ],
    approxGenerations: "~100 images or ~6 videos",
  },
  {
    id: "creator",
    name: "Creator",
    price: 2499,
    credits: 1000,
    dailyCredits: 0,
    popular: true,
    features: [
      "1,000 credits / month",
      "No watermark",
      "All models unlocked",
      "Priority queue",
      "Social posting",
    ],
    approxGenerations: "~333 images or ~20 videos",
  },
  {
    id: "pro",
    name: "Pro",
    price: 4999,
    credits: 3000,
    dailyCredits: 0,
    features: [
      "3,000 credits / month",
      "No watermark",
      "All models unlocked",
      "Priority queue",
      "API access",
      "Priority support",
    ],
    approxGenerations: "~1,000 images or ~60 videos",
  },
  {
    id: "studio",
    name: "Studio",
    price: 9999,
    credits: 8000,
    dailyCredits: 0,
    features: [
      "8,000 credits / month",
      "No watermark",
      "All models unlocked",
      "Priority queue",
      "API access",
      "Team features",
      "Dedicated support",
    ],
    approxGenerations: "~2,666 images or ~160 videos",
  },
];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function formatPrice(cents: number): string {
  if (cents === 0) return "$0";
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatPricePerMonth(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}/mo`;
}

export const TOPUP_PACKAGES = [
  { id: "topup-50", credits: 50, price: 499, label: "50 credits" },
  { id: "topup-150", credits: 150, price: 1299, label: "150 credits", savings: "save 13%" },
  { id: "topup-500", credits: 500, price: 3999, label: "500 credits", savings: "save 20%" },
  { id: "topup-1000", credits: 1000, price: 6999, label: "1,000 credits", savings: "save 30%" },
];
