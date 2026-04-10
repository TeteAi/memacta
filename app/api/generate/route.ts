import { NextResponse } from "next/server";
import { z } from "zod";
import { getProvider } from "@/lib/ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const Body = z.object({
  prompt: z.string().min(1),
  model: z.string().min(1),
  mediaType: z.enum(["video", "image"]),
  imageUrl: z.string().url().optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).optional(),
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
  const body = parsed.data;
  const result = await getProvider(body.model).generate(body);
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (userId) {
      await prisma.generation.create({
        data: {
          userId,
          model: body.model,
          mediaType: body.mediaType,
          prompt: body.prompt,
          imageUrl: body.imageUrl ?? null,
          status: result.status,
          resultUrl: result.url ?? null,
        },
      });
    }
  } catch {
    // ignore persistence errors
  }
  return NextResponse.json(result);
}
