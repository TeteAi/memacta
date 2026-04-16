import { NextResponse } from "next/server";
import { z } from "zod";
import { callLlm, type LlmMessage } from "@/lib/ai/llm";

const Body = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
});

// Legacy /api/chat endpoint. Preserved for any direct callers / legacy tests.
// Now backed by the real LLM wrapper — no more mock replies. If FAL_KEY is
// missing or the call fails, we return a graceful fallback so the client
// doesn't error out.
export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const messages: LlmMessage[] = parsed.data.messages;
  const reply = await callLlm(messages, { timeoutMs: 15000 });

  return NextResponse.json({
    reply:
      reply ??
      "I'm here — ask me what you want to create and I'll pick the right tool.",
  });
}
