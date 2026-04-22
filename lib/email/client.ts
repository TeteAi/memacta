/**
 * Transactional email client — wraps Resend.
 *
 * Graceful degradation:
 *  - Dev without RESEND_API_KEY  → logs the email to console, returns ok=true.
 *  - Prod without RESEND_API_KEY → throws at call-time so Vercel surfaces the error.
 *
 * Usage:
 *   import { sendEmail } from "@/lib/email/client";
 *   await sendEmail({ to: "...", subject: "...", html: "..." });
 */

import { Resend } from "resend";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  /** Rendered HTML body. Use a template from lib/email/templates/. */
  html: string;
  /** Optional plain-text fallback. */
  text?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/** Returns true when the Resend API key is present in env. */
export function isConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
}

/**
 * Sends a transactional email.
 * Never throws — always returns a result object so callers can decide
 * whether to surface the failure.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      // Fail-closed in prod — this is a mis-configured deployment.
      throw new Error(
        "[email] RESEND_API_KEY is required in production but is not set."
      );
    }
    // Dev fallback — log the email to the console.
    // eslint-disable-next-line no-console
    console.log(
      "[email:dev] Would send email (no RESEND_API_KEY set):\n",
      JSON.stringify(
        {
          from: getFromAddress(),
          to: opts.to,
          subject: opts.subject,
          htmlLength: opts.html.length,
          text: opts.text?.slice(0, 200) ?? "(none)",
        },
        null,
        2
      )
    );
    return { ok: true, id: "dev-noop" };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error("[email] Resend send error:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // eslint-disable-next-line no-console
    console.error("[email] Unexpected error:", msg);
    return { ok: false, error: msg };
  }
}
