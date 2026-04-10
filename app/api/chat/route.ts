import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  messages: z.array(
    z.object({ role: z.string(), content: z.string() })
  ),
});

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
  return NextResponse.json({ reply: "memacta: I understand. (mock)" });
}
