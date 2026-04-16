import { NextRequest, NextResponse } from "next/server";
import { buildCopilotSuggestion } from "@/lib/copilot";

// NOTE: Copilot suggestions do NOT burn generation credits — they are purely
// a routing helper. The 401 / auth gate is only triggered by downstream
// /api/generate calls. This route is intentionally open to anonymous users
// with unlimited queries.

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  let body: { messages?: unknown; intent?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Validate messages
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (body.messages.length > 50) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const messages = body.messages as Message[];

  // Validate each message
  for (const msg of messages) {
    if (
      typeof msg !== "object" ||
      msg === null ||
      !["user", "assistant"].includes(msg.role) ||
      typeof msg.content !== "string"
    ) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
  }

  // Optional intent tag from starter grid
  const intent =
    typeof body.intent === "string" && body.intent.length > 0
      ? body.intent
      : undefined;

  // Get the last user message
  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  if (!lastUserMessage) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Pure, deterministic suggestion — no external LLM call
  const suggestion = buildCopilotSuggestion(lastUserMessage, intent);

  return NextResponse.json(suggestion);
}
