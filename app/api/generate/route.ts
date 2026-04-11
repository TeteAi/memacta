import { NextResponse } from "next/server";
import { z } from "zod";
import { getProvider } from "@/lib/ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getCreditCost } from "@/lib/credits";
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

  // Auth check
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

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
    const result = await getProvider(body.model).generate(body);
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

  const result = await getProvider(body.model).generate(body);

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
