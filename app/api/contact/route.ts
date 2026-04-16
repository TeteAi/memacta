import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(5000),
});

// Inbound contact throttle: one message per 60s per IP address, so a bot
// can't flood the table. Also acts as a basic abuse backstop until we wire
// a real spam service (hcaptcha / turnstile).
const CONTACT_COOLDOWN_MS = 60_000;
const RECENT_BY_IP = new Map<string, number>();

function getIp(req: Request): string | null {
  const header = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
  if (!header) return null;
  return header.split(",")[0]?.trim() ?? null;
}

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

  const ip = getIp(req);
  if (ip) {
    const last = RECENT_BY_IP.get(ip) ?? 0;
    if (Date.now() - last < CONTACT_COOLDOWN_MS) {
      return NextResponse.json(
        {
          error: "rate_limited",
          message: "Please wait a minute between messages.",
        },
        { status: 429 }
      );
    }
    RECENT_BY_IP.set(ip, Date.now());
    // Keep the map bounded — clear entries older than 5 min every time we
    // cross 1000 entries. Rough heuristic so we don't leak memory on a busy
    // serverless instance.
    if (RECENT_BY_IP.size > 1000) {
      const cutoff = Date.now() - 5 * 60_000;
      for (const [k, v] of RECENT_BY_IP) {
        if (v < cutoff) RECENT_BY_IP.delete(k);
      }
    }
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

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      event: "contact.received",
      from: parsed.data.email,
      subject: parsed.data.subject ?? null,
      length: parsed.data.message.length,
      userId,
    })
  );

  return NextResponse.json({ sent: true });
}
