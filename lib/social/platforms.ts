export interface SocialPlatform {
  id: "instagram" | "tiktok" | "x" | "youtube";
  name: string;
  icon: string;
  color: string;
  oauthUrl: string;
  scopes: string[];
  supportsImage: boolean;
  supportsVideo: boolean;
  maxCaptionLength: number;
}

export const PLATFORMS: SocialPlatform[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: "camera",
    color: "#E1306C",
    oauthUrl: "https://api.instagram.com/oauth/authorize",
    scopes: ["instagram_basic", "instagram_content_publish"],
    supportsImage: true,
    supportsVideo: true,
    maxCaptionLength: 2200,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "music",
    color: "#00f2ea",
    oauthUrl: "https://www.tiktok.com/v2/auth/authorize",
    scopes: ["video.upload"],
    supportsImage: false,
    supportsVideo: true,
    maxCaptionLength: 2200,
  },
  {
    id: "x",
    name: "X (Twitter)",
    icon: "twitter",
    color: "#1DA1F2",
    oauthUrl: "https://twitter.com/i/oauth2/authorize",
    scopes: ["tweet.write", "users.read"],
    supportsImage: true,
    supportsVideo: true,
    maxCaptionLength: 280,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "youtube",
    color: "#FF0000",
    oauthUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scopes: ["https://www.googleapis.com/auth/youtube.upload"],
    supportsImage: false,
    supportsVideo: true,
    maxCaptionLength: 5000,
  },
];

export function getPlatform(id: string): SocialPlatform | undefined {
  return PLATFORMS.find((p) => p.id === id);
}
