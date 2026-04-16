import { fal } from "@fal-ai/client";

/**
 * Thin wrapper over fal.ai's `fal-ai/any-llm` endpoint — gives Copilot a real
 * conversational reply without introducing a new API key. If FAL_KEY is unset
 * or the call fails, callers should fall back to their rule-based default so
 * the UX degrades gracefully.
 */

export type LlmMessage = { role: "user" | "assistant" | "system"; content: string };

const FAL_LLM_ENDPOINT = "fal-ai/any-llm";
const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet";

// any-llm accepts a flat `prompt` plus optional `system_prompt` + `model`.
// We linearize the chat history into a single prompt so one call suffices.
function linearize(messages: LlmMessage[]): { prompt: string; system: string } {
  const system =
    messages.find((m) => m.role === "system")?.content ??
    [
      "You are Copilot — memacta's in-app AI director.",
      "You help creators pick the right model, tool, or preset for their idea.",
      "Be warm, concrete, and short (2-4 sentences max). Never say you're a bot.",
      "Do NOT invent tool names. The real tools are: Fashion Factory, Soul Cinema,",
      "Popcorn, Mixed Media, Soul ID, AI Influencer, image-to-video, /create/video,",
      "/create/image, and the 18 models (kling-3, kling-25-turbo, sora-2, veo-3,",
      "wan-26, seedance-pro, nano-banana-pro, flux-2, flux-kontext, soul-v2, etc.).",
      "If the user asks for a model, suggest ONE. If they're fuzzy, ask one short",
      "follow-up question. Action chips are added automatically — do NOT output",
      "URLs, markdown links, or JSON yourself.",
    ].join(" ");

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

  fal.config({ credentials: key });

  // Hard timeout — Copilot should never hang on the LLM round-trip. If it
  // takes too long we return null and let the rule-based reply ship instead.
  const timeoutMs = opts?.timeoutMs ?? 12000;
  const timer = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));

  try {
    const run = fal
      .subscribe(FAL_LLM_ENDPOINT, {
        input: {
          prompt,
          system_prompt: system,
          model: opts?.model ?? DEFAULT_MODEL,
        },
        logs: false,
      })
      .then((result) => {
        const data = result.data as { output?: unknown } | undefined;
        if (!data) return null;
        const out = data.output;
        return typeof out === "string" && out.trim().length > 0 ? out.trim() : null;
      })
      .catch(() => null);

    return (await Promise.race([run, timer])) ?? null;
  } catch {
    return null;
  }
}
