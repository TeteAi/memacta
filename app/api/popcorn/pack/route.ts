import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { buildPopcornBatch } from "@/lib/popcorn";
import { getProvider } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { getCreditCost } from "@/lib/credits";
import { checkDailyCap } from "@/lib/daily-cap";
import { isAdminEmail } from "@/lib/admin";
import { moderatePrompt, moderationMessage } from "@/lib/moderation";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

const Body = z.object({
  presetId: z.string().min(1),
  subjectPrompt: z.string().min(1),
  subjectImageUrl: z.string().url().optional(),
  seeds: z.tuple([z.number(), z.number(), z.number()]).optional(),
});

export async function POST(req: Request) {
  // Per-IP burst limit BEFORE auth — same shape as /api/generate. A pack run
  // fans out three video generations, so even a moderate burst would torch
  // the fal bill in seconds without this gate.
  const burstCheck = await rateLimit(rateLimitKey(req, null), {
    windowMs: 60_000,
    max: 5,
  });
  if (!burstCheck.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Too many pack requests. Please wait a minute.",
        retryAfter: Math.ceil(burstCheck.retryAfterMs / 1000),
      },
      {
        status: 429,
        headers: {
          "retry-after": String(Math.ceil(burstCheck.retryAfterMs / 1000)),
        },
      }
    );
  }

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const userEmail = session?.user?.email ?? null;

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

  // Reject obviously bad prompts before we authenticate the bill.
  const moderation = moderatePrompt(subjectPrompt);
  if (!moderation.allowed) {
    return NextResponse.json(
      {
        error: "moderation_blocked",
        message: moderationMessage(moderation.reason),
      },
      { status: 400 }
    );
  }

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

  // Each clip is its own video generation — sum the credit cost of all three
  // up front so we either commit the full pack or refuse cleanly.
  const totalCost = batch.reduce(
    (sum, b) => sum + getCreditCost(b.model, b.mediaType),
    0
  );

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }
  if (user.credits < totalCost) {
    return NextResponse.json(
      {
        error: "insufficient_credits",
        required: totalCost,
        balance: user.credits,
        message: `A Popcorn pack costs ${totalCost} credits — you have ${user.credits}.`,
      },
      { status: 402 }
    );
  }

  // Daily cap — same rolling 24h window as /api/generate. Admins skip it.
  if (!isAdminEmail(userEmail)) {
    const capCheck = await checkDailyCap(userId, totalCost);
    if (!capCheck.ok) {
      const { cap, usedToday, remaining, resetAt } = capCheck.status;
      return NextResponse.json(
        {
          error: "daily_cap_reached",
          message:
            `A Popcorn pack costs ${totalCost} credits, but only ${remaining} of your daily ` +
            `${cap}-credit limit is left (${usedToday} used in the last 24h). Upgrade or come back later.`,
          cap,
          usedToday,
          remaining,
          requested: totalCost,
          resetAt: resetAt.toISOString(),
        },
        { status: 429 }
      );
    }
  }

  // Deduct up front so concurrent calls don't double-spend, then write a
  // single ledger row per clip below — refunding any failures individually.
  const debited = await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: totalCost } },
    select: { credits: true },
  });

  for (const b of batch) {
    const cost = getCreditCost(b.model, b.mediaType);
    try {
      await prisma.creditTransaction.create({
        data: {
          userId,
          amount: -cost,
          balance: debited.credits,
          type: "generation",
          description: `popcorn pack — ${presetId} (${b.model})`,
          modelId: b.model,
        },
      });
    } catch {
      /* non-fatal — main user.credits update already committed */
    }
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
      return { seed: payload.seed, mediaUrl: result.url, model: payload.model };
    }),
  );

  // Refund any failed clips individually so users only pay for what worked.
  const refundsByModel: Array<{ model: string; cost: number }> = [];
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const b = batch[i];
      refundsByModel.push({
        model: b.model,
        cost: getCreditCost(b.model, b.mediaType),
      });
    }
  });

  if (refundsByModel.length > 0) {
    const refundTotal = refundsByModel.reduce((s, r) => s + r.cost, 0);
    const refunded = await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: refundTotal } },
      select: { credits: true },
    });
    for (const r of refundsByModel) {
      try {
        await prisma.creditTransaction.create({
          data: {
            userId,
            amount: r.cost,
            balance: refunded.credits,
            type: "refund",
            description: `popcorn pack refund — ${presetId} (${r.model} failed)`,
            modelId: r.model,
          },
        });
      } catch {
        /* non-fatal */
      }
    }
  }

  const clips = results.map((r, i) => {
    const seed = batch[i].seed;
    if (r.status === "fulfilled") {
      return { seed, mediaUrl: r.value.mediaUrl };
    }
    return { seed, error: (r.reason as Error).message ?? "Generation failed" };
  });

  // Persist a project row so the user can find their pack again later.
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
