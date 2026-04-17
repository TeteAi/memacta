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

const CreateBody = z.object({
  name: z.string().min(1),
  clips: z.array(ClipSchema),
});

// Both GET and POST now require auth. Previously, signed-out GET returned
// ALL projects from ALL users (same leak pattern as /library).

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json({ projects: [] });
  }
}

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
  const parsed = CreateBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  try {
    const project = await prisma.project.create({
      data: {
        userId,
        name: parsed.data.name,
        clipsJson: JSON.stringify(parsed.data.clips),
      },
    });
    return NextResponse.json(project);
  } catch (e) {
    return NextResponse.json(
      { error: "server", detail: String(e) },
      { status: 500 }
    );
  }
}
