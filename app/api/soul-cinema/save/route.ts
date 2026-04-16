import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const ClipSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  model: z.string(),
  resultUrl: z.string().optional(),
  durationSec: z.number(),
  order: z.number(),
});

const BodySchema = z.object({
  name: z.string().min(1),
  clips: z.array(ClipSchema),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const project = await prisma.project.create({
      data: {
        userId,
        name: parsed.data.name,
        clipsJson: JSON.stringify(parsed.data.clips),
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "server", detail: String(e) }, { status: 500 });
  }
}
