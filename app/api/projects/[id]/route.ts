import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const ClipSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  model: z.string(),
  resultUrl: z.string().optional(),
  durationSec: z.number(),
  order: z.number(),
});

const PatchBody = z.object({
  name: z.string().min(1).optional(),
  clips: z.array(ClipSchema).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: "not-found" }, { status: 404 });
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const parsed = PatchBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  try {
    const data: { name?: string; clipsJson?: string } = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.clips !== undefined) data.clipsJson = JSON.stringify(parsed.data.clips);
    const project = await prisma.project.update({ where: { id }, data });
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
