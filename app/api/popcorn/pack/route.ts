import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { buildPopcornBatch } from "@/lib/popcorn";
import { getProvider } from "@/lib/ai";
import { prisma } from "@/lib/db";

const Body = z.object({
  presetId: z.string().min(1),
  subjectPrompt: z.string().min(1),
  subjectImageUrl: z.string().url().optional(),
  seeds: z.tuple([z.number(), z.number(), z.number()]).optional(),
});

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
    return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  }

  const { presetId, subjectPrompt, subjectImageUrl, seeds } = parsed.data;

  let batch: ReturnType<typeof buildPopcornBatch>;
  try {
    batch = buildPopcornBatch(
      presetId,
      subjectPrompt,
      subjectImageUrl,
      seeds,
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  // Fan out 3 generation requests concurrently
  const results = await Promise.allSettled(
    batch.map(async (payload) => {
      const provider = getProvider(payload.model);
      const result = await provider.generate({
        prompt: payload.prompt,
        model: payload.model,
        mediaType: payload.mediaType,
        imageUrl: payload.imageUrl,
        aspectRatio: payload.aspectRatio,
        durationSec: payload.duration,
        seed: payload.seed,
      });
      return { seed: payload.seed, mediaUrl: result.url };
    }),
  );

  const clips = results.map((r, i) => {
    const seed = batch[i].seed;
    if (r.status === "fulfilled") {
      return { seed, mediaUrl: r.value.mediaUrl };
    }
    return { seed, error: (r.reason as Error).message ?? "Generation failed" };
  });

  // Persist a project row
  const packId = `popcorn-${Date.now()}`;
  try {
    await prisma.project.create({
      data: {
        userId,
        name: `Popcorn pack — ${presetId}`,
        clipsJson: JSON.stringify({ presetId, seeds: batch.map((b) => b.seed), clips }),
      },
    });
  } catch {
    // non-fatal — clips still returned
  }

  return NextResponse.json({ packId, clips });
}
