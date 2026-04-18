/**
 * HS256 JWT helper for securing fal.ai training webhook callbacks.
 *
 * The webhook URL is signed before being sent to fal so that a random
 * POST to /api/webhooks/fal/training cannot flip persona state.
 *
 * Secret: PERSONA_WEBHOOK_SECRET (required in production)
 * TTL: 30 minutes (training typically completes in 15-20 min)
 * Payload: { personaId, jobId, exp }
 */

const ALG = "HS256";
const TTL_MS = 30 * 60 * 1000; // 30 minutes

function getSecret(): string {
  const secret = process.env.PERSONA_WEBHOOK_SECRET;
  if (!secret) {
    // In dev/test without the env var, use a placeholder.
    // In prod this must be set — middleware will reject tokens signed with this.
    return "dev-placeholder-secret-not-for-production";
  }
  return secret;
}

// Minimal HS256 JWT implementation (Node crypto, no external deps)
import crypto from "crypto";

function base64url(buf: Buffer | string): string {
  const b64 = Buffer.isBuffer(buf) ? buf.toString("base64") : Buffer.from(buf).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64urlDecode(s: string): Buffer {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  return Buffer.from(pad ? padded + "=".repeat(4 - pad) : padded, "base64");
}

export interface WebhookTokenPayload {
  personaId: string;
  jobId: string;
  exp: number; // unix epoch seconds
}

export function sign(payload: Omit<WebhookTokenPayload, "exp">): string {
  const header = base64url(JSON.stringify({ alg: ALG, typ: "JWT" }));
  const exp = Math.floor((Date.now() + TTL_MS) / 1000);
  const body = base64url(JSON.stringify({ ...payload, exp }));
  const data = `${header}.${body}`;
  const sig = crypto.createHmac("sha256", getSecret()).update(data).digest();
  return `${data}.${base64url(sig)}`;
}

export function verify(token: string): WebhookTokenPayload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT structure");

  const [headerB64, bodyB64, sigB64] = parts;
  const data = `${headerB64}.${bodyB64}`;

  // Verify signature
  const expectedSig = crypto.createHmac("sha256", getSecret()).update(data).digest();
  const actualSig = base64urlDecode(sigB64);

  if (!crypto.timingSafeEqual(expectedSig, actualSig)) {
    throw new Error("Invalid JWT signature");
  }

  // Decode payload
  const payload = JSON.parse(base64urlDecode(bodyB64).toString("utf8")) as WebhookTokenPayload;

  // Verify expiry
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("JWT expired");
  }

  return payload;
}
