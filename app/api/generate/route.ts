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
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";
import { applyPixelWatermark } from "@/lib/watermark/apply";
import { shouldApplyServerWatermark } from "@/lib/persona/gates";
import { trackFirstGeneration } from "@/lib/analytics/persona";
import { uploadGenerationOutput } from "@/lib/storage/upload";

const Body = z.object({
  prompt: z.string().min(1),
  model: z.string().min(1),
  mediaType: z.enum(["video", "image"]),
  imageUrl: z.string().url().optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).optional(),
  // Incoming from the video form as a string ("5", "10", …). Coerce to a number.
  duration: z.coerce.number().int().min(1).max(60).optional(),
  seed: z.number().int().optional(),
  // Persona attribution (soul-id feature)
  personaId: z.string().optional(),
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

  // Per-caller burst throttle. Signed-in users already have a daily
  // credit cap; this catches the "generate in a tight loop" scripted
  // abuse that would otherwise burn through credits + fal bill in
  // minutes. Anon users hit this before their free-gen cookie too, so
  // someone can't fan out across cookies from the same IP.
  const preSessionCheck = await rateLimit(rateLimitKey(req, null), {
    windowMs: 60_000,
    max: 10,
  });
  if (!preSessionCheck.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Too many requests. Please slow down.",
        retryAfter: Math.ceil(preSessionCheck.retryAfterMs / 1000),
      },
      {
        status: 429,
        headers: {
          "retry-after": String(Math.ceil(preSessionCheck.retryAfterMs / 1000)),
        },
      }
    );
  }

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
    personaId: body.personaId,
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
      const { cap, usedToday, remaining, resetAt } = capCheck.status;
      const resetLocal = resetAt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      });
      const message =
        `This generation costs ${creditCost} credits, but only ${remaining} of your daily ${cap}-credit limit is left ` +
        `(${usedToday} used in the last 24h). Try a budget model, upgrade your plan, or come back after ${resetLocal} UTC.`;
      return NextResponse.json(
        {
          error: "daily_cap_reached",
          message,
          cap,
          usedToday,
          remaining,
          requested: creditCost,
          resetAt: resetAt.toISOString(),
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

  // Resolve Persona identity if personaId is provided
  let resolvedResultUrl = result.url ?? null;
  let personaId: string | null = body.personaId ?? null;

  if (personaId && result.url && body.mediaType === "image") {
    try {
      // Fetch the persona to get identity info + determine watermark need
      const persona = await prisma.persona.findFirst({
        where: { id: personaId, userId },
        select: {
          id: true,
          tier: true,
          status: true,
          primaryPhotoUrl: true,
          loraUrl: true,
          triggerWord: true,
          loraScale: true,
          createdAt: true,
        },
      });

      if (persona) {
        // Check if this is the first generation with this persona
        const genCount = await prisma.generation.count({ where: { userId, personaId } });
        if (genCount === 0) {
          trackFirstGeneration({
            userId,
            personaId,
            timeSinceCreateMs: Date.now() - persona.createdAt.getTime(),
          });
        }

        // Apply server-side watermark for free-tier users with persona-attributed outputs
        const userForGate = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            emailVerified: true,
            createdAt: true,
            premiumLoraTrainsUsed: true,
            subscription: { select: { planId: true } },
          },
        });

        if (userForGate && shouldApplyServerWatermark(userForGate)) {
          // Fetch the image and apply watermark
          const imgRes = await fetch(result.url).catch(() => null);
          if (imgRes?.ok) {
            const imgBuf = Buffer.from(await imgRes.arrayBuffer());
            const watermarked = await applyPixelWatermark({
              input: imgBuf,
              corner: "bottom-right",
              widthRatio: 0.1,
            });
            // Upload to Supabase Storage when configured; fall back to data URL in dev
            const genId = crypto.randomUUID();
            const uploadResult = await uploadGenerationOutput(
              userId,
              genId,
              watermarked.output,
              `image/${watermarked.format}`
            ).catch(() => null);

            if (uploadResult) {
              resolvedResultUrl = uploadResult.publicUrl;
            } else {
              // Dev fallback: data URL (storage not configured)
              resolvedResultUrl = `data:image/${watermarked.format};base64,${watermarked.output.toString("base64")}`;
            }
          }
        }
      }
    } catch (e) {
      // Non-fatal: persona resolution errors don't block generation
      // eslint-disable-next-line no-console
      console.warn("[generate] persona resolution error:", e instanceof Error ? e.message : String(e));
    }
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
        resultUrl: resolvedResultUrl,
        personaId: personaId ?? undefined,
      },
    });
  } catch {
    // ignore persistence errors
  }

  return NextResponse.json({ ...result, resultUrl: resolvedResultUrl, creditsRemaining: updatedUser.credits });
}
