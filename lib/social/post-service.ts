export interface PostRequest {
  platform: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  accessToken: string;
}

export interface PostResult {
  success: boolean;
  platformPostId?: string;
  error?: string;
}

export async function publishToSocial(req: PostRequest): Promise<PostResult> {
  // Stub: In production, this calls each platform's API
  // For now, simulate success after a short delay
  await new Promise((r) => setTimeout(r, 500));
  return {
    success: true,
    platformPostId: `mock-${req.platform}-${Date.now()}`,
  };
}
