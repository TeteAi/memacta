/**
 * POST /api/persona  — Create a new Persona draft
 * GET  /api/persona  — List all Personas for the authenticated user
 *
 * Rate limit: 10/hr/user on POST
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { createPersonaDraft, listPersonas } from "@/lib/persona/service";
import { canCreatePersona } from "@/lib/persona/gates";
import { trackPersonaCreated } from "@/lib/analytics/persona";

const CreateBody = z.object({
  name: z.string().min(1).max(60),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  // Rate limit: 10 persona creations per hour per user
  const rl = rateLimit(`persona:create:${userId}`, { windowMs: 60 * 60 * 1000, max: 10 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfter: Math.ceil(rl.retryAfterMs / 1000) },
      { status: 429 }
    );
  }

  // Fetch user for gate checks
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, emailVerified: true, createdAt: true, premiumLoraTrainsUsed: true, subscription: { select: { planId: true } } },
  });
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  const gate = canCreatePersona(user);
  if (!gate.allowed) {
    return NextResponse.json({ error: "forbidden", reason: gate.reason }, { status: 403 });
  }

  let body: z.infer<typeof CreateBody>;
  try {
    const json = await req.json();
    const parsed = CreateBody.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const persona = await createPersonaDraft({ userId, name: body.name });

  trackPersonaCreated({ userId, personaId: persona.id, tier: persona.tier, photoCount: 0 });

  return NextResponse.json(persona, { status: 201 });
}

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const personas = await listPersonas(userId);
  return NextResponse.json(personas);
}
