import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

// Claim endpoint for the pending-generations stash: once a visitor signs up
// (or signs back in), the client posts their stashed anonymous generations
// here and we materialize them as real Generation rows so they show up in
// My Library. No credits involved — the user already paid for them as an
// anon via the free-tier cookie counter.

const Item = z.object({
  model: z.string().min(1).max(80),
  mediaType: z.enum(["image", "video"]),
  prompt: z.string().min(1).max(5000),
  imageUrl: z.string().url().max(2048).nullable().optional(),
  resultUrl: z.string().url().max(2048),
  // createdAt is informational only — we don't trust client clocks, and
  // Prisma's default(now()) is fine for ordering.
  createdAt: z.string().optional(),
  clientId: z.string().optional(),
});

const Body = z.object({
  items: z.array(Item).min(1).max(10),
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
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Dedupe server-side: if the user somehow posts the same URL twice (tabs,
  // stale stash, retry), skip rather than creating duplicate rows.
  const urls = parsed.data.items.map((i) => i.resultUrl);
  const existing = await prisma.generation.findMany({
    where: { userId, resultUrl: { in: urls } },
    select: { resultUrl: true },
  });
  const existingSet = new Set(existing.map((e) => e.resultUrl));

  const toCreate = parsed.data.items.filter(
    (i) => !existingSet.has(i.resultUrl)
  );

  let claimed = 0;
  for (const item of toCreate) {
    try {
      await prisma.generation.create({
        data: {
          userId,
          model: item.model,
          mediaType: item.mediaType,
          prompt: item.prompt,
          imageUrl: item.imageUrl ?? null,
          status: "completed",
          resultUrl: item.resultUrl,
        },
      });
      claimed += 1;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        JSON.stringify({
          event: "generations.claim_failed",
          userId,
          resultUrl: item.resultUrl,
          error: err instanceof Error ? err.message : String(err),
        })
      );
    }
  }

  if (claimed > 0) {
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        event: "generations.claimed",
        userId,
        claimed,
        skipped: parsed.data.items.length - claimed,
      })
    );
  }

  return NextResponse.json({
    claimed,
    skipped: parsed.data.items.length - claimed,
  });
}
