import { NextResponse } from "next/server";
import { z } from "zod";
import { getProvider } from "@/lib/ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getCreditCost } from "@/lib/credits";
import { checkDailyCap } from "@/lib/daily-cap";
import { isAdminEmail } from "@/lib/admin";
import { moderatePrompt, moderationMessage } from "@/lib/moderation";
import {
  ANON_COOKIE_NAME,
  ANON_MAX_GENERATIONS,
  getAnonGenerationCount,
  incrementAnonGenerationCount,
} from "@/lib/anonymous-credits";
import { cookies } from "next/headers";

const Body = z.object({
  prompt: z.string().min(1),
  model: z.string().min(1),
  mediaType: z.enum(["video", "image"]),
  imageUrl: z.string().url().optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).optional(),
  // Incoming from the video form as a string ("5", "10", …). Coerce to a number.
  duration: z.coerce.number().int().min(1).max(60).optional(),
  seed: z.number().int().optional(),
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

  // Prompt moderation — runs BEFORE auth/credits so we don't even authenticate
  // a user whose prompt is going to be rejected. Saves a DB roundtrip on every
  // blocked request and gives the client a fast, clear reason to rephrase.
  const moderation = moderatePrompt(body.prompt);
  if (!moderation.allowed) {
    // eslint-disable-next-line no-console
    console.warn(
      JSON.stringify({
        event: "generate.moderation_blocked",
        reason: moderation.reason,
        // Truncate — we want aggregate visibility into abuse, not a full
        // prompt log that could contain PII.
        promptPreview: body.prompt.slice(0, 80),
      })
    );
    return NextResponse.json(
      {
        error: "prompt_blocked",
        reason: moderation.reason,
        message: moderationMessage(moderation.reason),
      },
      { status: 400 }
    );
  }

  // Translate the wire-format `duration` field into the provider's `durationSec`.
  // Keep the untouched body for persistence (prompt/model/mediaType/imageUrl) and
  // build a separate `providerReq` for the generator.
  const providerReq = {
    prompt: body.prompt,
    model: body.model,
    mediaType: body.mediaType,
    imageUrl: body.imageUrl,
    aspectRatio: body.aspectRatio,
    durationSec: body.duration,
    seed: body.seed,
  };

  // Auth check
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const userEmail = session?.user?.email ?? null;

  if (!userId) {
    // Anonymous user — check cookie-based generation count
    const cookieStore = await cookies();
    const anonCookie = cookieStore.get(ANON_COOKIE_NAME)?.value;
    const anonCount = getAnonGenerationCount(anonCookie);

    if (anonCount >= ANON_MAX_GENERATIONS) {
      return NextResponse.json(
        {
          error: "auth_required",
          message: "Sign up to continue creating",
        },
        { status: 401 }
      );
    }

    // Allow the generation and increment the count
    const result = await getProvider(body.model).generate(providerReq);
    const newCount = incrementAnonGenerationCount(anonCount);

    const response = NextResponse.json(result);
    response.cookies.set(ANON_COOKIE_NAME, newCount, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    return response;
  }

  // Logged-in user — check and deduct credits
  const creditCost = getCreditCost(body.model, body.mediaType);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  if (user.credits < creditCost) {
    return NextResponse.json(
      {
        error: "insufficient_credits",
        required: creditCost,
        balance: user.credits,
      },
      { status: 402 }
    );
  }

  // Rolling 24h daily cap — prevents a single tester from torching the fal
  // bill in an hour. Net of refunds, so failed generations don't count.
  // Admins (owner allowlist) skip the cap so we can smoke-test freely; every
  // other safeguard (moderation, credit deduction, ledger) still applies.
  if (!isAdminEmail(userEmail)) {
    const capCheck = await checkDailyCap(userId, creditCost);
    if (!capCheck.ok) {
      return NextResponse.json(
        {
          error: "daily_cap_reached",
          message: "You've hit today's generation cap. Comes back in a few hours.",
          cap: capCheck.status.cap,
          usedToday: capCheck.status.usedToday,
          resetAt: capCheck.status.resetAt.toISOString(),
        },
        { status: 429 }
      );
    }
  }

  // Deduct credits and run generation concurrently (deduct first to prevent double-spend)
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: creditCost } },
    select: { credits: true },
  });

  // Create transaction record
  try {
    await prisma.creditTransaction.create({
      data: {
        userId,
        amount: -creditCost,
        balance: updatedUser.credits,
        type: "generation",
        description: `${body.mediaType} generation with ${body.model}`,
        modelId: body.model,
      },
    });
  } catch {
    // non-fatal
  }

  const startedAt = Date.now();
  const result = await getProvider(body.model).generate(providerReq);
  const elapsedMs = Date.now() - startedAt;

  // If generation itself failed, refund the credits so users aren't charged for nothing.
  if (result.status === "failed") {
    // Structured log so Vercel's log search picks it up cleanly. Gives us the
    // shape we need to triage user reports: which model, how long, why.
    // eslint-disable-next-line no-console
    console.warn(
      JSON.stringify({
        event: "generate.failed",
        model: body.model,
        mediaType: body.mediaType,
        elapsedMs,
        error: result.error,
        userId,
      })
    );
    const refunded = await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: creditCost } },
      select: { credits: true },
    });
    try {
      await prisma.creditTransaction.create({
        data: {
          userId,
          amount: creditCost,
          balance: refunded.credits,
          type: "refund",
          description: `Refund — ${body.model} generation failed`,
          modelId: body.model,
        },
      });
    } catch {
      // non-fatal
    }
    // Map the provider's error into the shape the UI consumes. `message` is
    // what tool forms show in their red banner (via the `message || error`
    // pattern). `error` stays as a stable machine-readable code fallback.
    return NextResponse.json(
      {
        ...result,
        message: result.error ?? "Generation failed. Please try again.",
        creditsRemaining: refunded.credits,
      },
      { status: 502 }
    );
  }

  // Persist generation record
  try {
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
  } catch {
    // ignore persistence errors
  }

  return NextResponse.json({ ...result, creditsRemaining: updatedUser.credits });
}
