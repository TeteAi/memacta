import { NextResponse } from "next/server";
import { z } from "zod";
import { buildSoulCinemaScript } from "@/lib/soul-cinema";

const BodySchema = z.object({
  storyPrompt: z.string().min(10),
  sceneCount: z.union([z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  genre: z.enum(["drama", "noir", "scifi", "romance", "action"]),
  tone: z.enum(["moody", "bright", "tense", "dreamy"]),
  characterName: z.string().min(1),
  characterRefUrl: z.string().optional(),
  seed: z.number().optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const scenes = buildSoulCinemaScript(parsed.data);
    return NextResponse.json({ scenes });
  } catch (e) {
    return NextResponse.json({ error: "script_error", detail: String(e) }, { status: 500 });
  }
}
