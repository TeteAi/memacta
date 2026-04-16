/**
 * Thin wrapper over fal.ai's `fal-ai/any-llm` endpoint — gives Copilot a real
 * conversational reply without introducing a new API key. If FAL_KEY is unset
 * or the call fails, callers should fall back to their rule-based default so
 * the UX degrades gracefully.
 */

export type LlmMessage = { role: "user" | "assistant" | "system"; content: string };

// fal.ai documented sync endpoint. POST payload is `{ model, prompt, system_prompt }`,
// response is `{ output: string, reasoning: boolean, partial: boolean, error: null | string }`.
// Ref: https://fal.ai/models/fal-ai/any-llm/api
const FAL_LLM_URL = "https://fal.run/fal-ai/any-llm";

// Gemini Flash is fal.ai's default any-llm model — widely supported, fast,
// generous free tier. Claude / GPT models are also available but have
// heavier per-call costs. Keep this swappable via env in case the user
// wants a different default.
const DEFAULT_MODEL = process.env.COPILOT_LLM_MODEL ?? "google/gemini-flash-1.5";

const COPILOT_SYSTEM = [
  "You are Copilot — memacta's in-app AI director.",
  "You help creators pick the right model, tool, or preset for their idea.",
  "Be warm, concrete, and short (2-4 sentences). Never say you're a bot.",
  "Real tools you can suggest: Fashion Factory, Soul Cinema, Popcorn, Mixed Media,",
  "Soul ID, AI Influencer, image-to-video, /create/video, /create/image.",
  "Real models: kling-3, kling-25-turbo, sora-2, veo-3, wan-26, seedance-pro,",
  "nano-banana-pro, flux-2, flux-kontext, soul-v2. Only recommend from this list.",
  "Action chips are added automatically — do NOT output URLs, markdown links, or JSON.",
  "If the user is fuzzy, ask ONE short follow-up question.",
].join(" ");

function linearize(messages: LlmMessage[]): { prompt: string; system: string } {
  const overrideSystem = messages.find((m) => m.role === "system")?.content;
  const system = overrideSystem && overrideSystem.length > 0 ? overrideSystem : COPILOT_SYSTEM;

  const history = messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  return { prompt: history, system };
}

export async function callLlm(
  messages: LlmMessage[],
  opts?: { model?: string; timeoutMs?: number }
): Promise<string | null> {
  const key = process.env.FAL_KEY;
  if (!key) return null;

  const { prompt, system } = linearize(messages);
  if (!prompt.trim()) return null;

  const controller = new AbortController();
  const timeoutMs = opts?.timeoutMs ?? 15000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(FAL_LLM_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Key ${key}`,
      },
      body: JSON.stringify({
        model: opts?.model ?? DEFAULT_MODEL,
        prompt,
        system_prompt: system,
      }),
    });

    if (!res.ok) {
      // Surface the fal error body to the server logs for diagnosis but don't
      // leak it to users — callers treat null as "fall back to rule engine".
      const text = await res.text().catch(() => "");
      // eslint-disable-next-line no-console
      console.warn(`[copilot-llm] fal.ai ${res.status}`, text.slice(0, 200));
      return null;
    }

    const data = (await res.json().catch(() => null)) as { output?: unknown; error?: unknown } | null;
    if (!data || typeof data.output !== "string") return null;
    const out = data.output.trim();
    return out.length > 0 ? out : null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[copilot-llm] fetch failed", err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
