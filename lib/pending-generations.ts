// Client-side stash for unauthenticated generations. When a visitor creates
// something without an account, we keep a small list in localStorage so they
// can "claim" it into their real library after signing up. The alternative
// (writing Generation rows with a null userId and reconciling server-side)
// adds a whole anonymous-identity layer; a capped localStorage list covers
// the common case (one free gen → sign up → see it in library) without any
// of that infrastructure.

export type PendingGeneration = {
  // Client-side id so we can dedupe + display before the real row exists.
  clientId: string;
  model: string;
  mediaType: "image" | "video";
  prompt: string;
  // Optional source image for image-to-video workflows.
  imageUrl?: string | null;
  // The generated output URL — what we actually want to preserve. Without
  // this the stash is useless, so callers should only call stash() after a
  // successful generation.
  resultUrl: string;
  createdAt: string; // ISO
};

const STORAGE_KEY = "memacta_pending_generations";
// Cap the stash so a bot-y browser can't eat megabytes of localStorage.
// 10 is well above the current 1-gen anon limit but leaves headroom if we
// later raise ANON_MAX_GENERATIONS.
const MAX_PENDING = 10;

function safeRead(): PendingGeneration[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PendingGeneration =>
        typeof item === "object" &&
        item !== null &&
        typeof item.resultUrl === "string" &&
        typeof item.prompt === "string"
    );
  } catch {
    return [];
  }
}

function safeWrite(items: PendingGeneration[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // QuotaExceeded or private-mode — nothing we can do; drop silently.
  }
}

export function stashPendingGeneration(
  item: Omit<PendingGeneration, "clientId" | "createdAt">
): void {
  const existing = safeRead();
  // Dedupe on resultUrl so re-renders don't double-stash.
  if (existing.some((e) => e.resultUrl === item.resultUrl)) return;
  const next: PendingGeneration = {
    ...item,
    clientId:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
  };
  // Newest first; trim from the tail.
  const merged = [next, ...existing].slice(0, MAX_PENDING);
  safeWrite(merged);
}

export function getPendingGenerations(): PendingGeneration[] {
  return safeRead();
}

export function clearPendingGenerations(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
