import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { callLlm, type LlmMessage } from "@/lib/ai/llm";

const Body = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
});

// /api/chat — LLM-backed chat for the AI copilot. Now requires auth so
// anonymous visitors can't burn FAL/LLM credits by POSTing directly.

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

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
