// Legacy stub route — the canonical Stripe webhook now lives at
// /api/billing/webhook. We re-export that handler here so any Stripe
// dashboard endpoint already pointing at /api/stripe/webhook keeps
// working. Delete once you've confirmed no existing webhook config
// points here.

export { POST, runtime, dynamic } from "@/app/api/billing/webhook/route";
