/**
 * Typed analytics event emitters for Persona feature.
 * Events defined in decisions.md under "Analytics events (Sprint 1 minimum)".
 *
 * Uses console.log structured JSON so Vercel log search / Sentry can pick them
 * up. Replace with a real analytics provider (PostHog, Segment, etc.) as the
 * product matures.
 */

type PersonaEventBase = {
  userId: string;
  personaId: string;
};

function emit(event: string, props: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ event, ...props, _ts: new Date().toISOString() }));
}

export function trackPersonaCreated(p: PersonaEventBase & { tier: string; photoCount: number }) {
  emit("persona.created", p);
}

export function trackInstantPreviewGenerated(p: PersonaEventBase) {
  emit("persona.instant_preview_generated", p);
}

export function trackUpgradedToPremium(
  p: PersonaEventBase & { success: boolean; failureReason?: string }
) {
  emit("persona.upgraded_to_premium", p);
}

export function trackTrainingStarted(p: PersonaEventBase) {
  emit("persona.training_started", p);
}

export function trackTrainingCompleted(p: PersonaEventBase) {
  emit("persona.training_completed", p);
}

export function trackTrainingFailed(p: PersonaEventBase & { error?: string }) {
  emit("persona.training_failed", p);
}

export function trackFirstGeneration(p: PersonaEventBase & { timeSinceCreateMs: number }) {
  emit("persona.first_generation", p);
}

export function trackDownloadPaywallHit(p: PersonaEventBase & { userId: string }) {
  emit("persona.download_paywall_hit", p);
}

export function trackShareWatermarkShown(p: PersonaEventBase) {
  emit("persona.share_watermark_shown", p);
}
