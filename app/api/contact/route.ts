import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(5000),
});

export async function POST(req: Request) {
  // Cross-instance rate limit (Upstash Redis in prod). Previously this was
  // an in-memory Map per serverless instance, which scaled to "60s cooldown
  // per instance" — i.e., one bot scattered across enough cold starts could
  // flood the contact table. Switch to the shared Upstash limiter.
  const rl = await rateLimit(rateLimitKey(req, null), {
    windowMs: 60_000,
    max: 1,
  });
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Please wait a minute between messages.",
        retryAfter: Math.ceil(rl.retryAfterMs / 1000),
      },
      {
        status: 429,
        headers: {
          "retry-after": String(Math.ceil(rl.retryAfterMs / 1000)),
        },
      }
    );
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

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

  try {
    await prisma.contactMessage.create({
      data: {
        userId,
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject ?? null,
        message: parsed.data.message,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        event: "contact.persist_failed",
        error: err instanceof Error ? err.message : String(err),
      })
    );
    return NextResponse.json(
      {
        error: "server",
        message: "We couldn't record your message. Please email hello@memacta.app directly.",
      },
      { status: 500 }
    );
  }

  // No structured success log — Vercel access logs already capture the 200
  // and we don't want a per-request JSON dump that includes the user's
  // email + message length on every contact submission. Errors above still
  // log via console.error, which is what triage actually needs.

  return NextResponse.json({ sent: true });
}
