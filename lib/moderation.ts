/**
 * Prompt moderation — deliberately small, opinionated keyword blocklist that
 * runs BEFORE the prompt is forwarded to fal.ai. The provider already has its
 * own moderation (and will reject the worst stuff), but we want to catch the
 * highest-risk categories locally so:
 *
 *  - We don't pay fal for a generation that's guaranteed to be refused
 *  - Users get a fast, clear rejection instead of a generic "failed"
 *  - Beta testers can't embarrass us in a screenshot before the provider's
 *    filters kick in (stories that would make good headlines)
 *
 * Categories focused on what gets clones of generative-video apps in trouble
 * in practice: sexualised minors, non-consensual intimate imagery, extremist
 * violence, and known deepfake vectors. Everything else is delegated to the
 * upstream provider.
 *
 * False positives are acceptable here — a rejected prompt can be rephrased.
 * We optimise for "no scraped news story about memacta" over "every edge
 * case sails through".
 */

// Lowercased, word-boundary-matched terms. Keep each short and unambiguous —
// compound phrases that catch too much noise belong in `BLOCKED_PHRASES`.
const BLOCKED_WORDS: string[] = [
  // Minors — any hint of sexualised children is a hard stop
  "child porn",
  "cp",
  "loli",
  "shota",
  "underage",
  "preteen",
  "minor nude",
  "kid naked",
  "kid nude",
  "child naked",
  "child nude",
  "schoolgirl nude",
  "schoolboy nude",

  // Non-consensual intimate imagery
  "revenge porn",
  "deepfake nude",
  "nude deepfake",
  "undress",
  "undressing",
  "nudify",

  // Extremist violence / CSAM-adjacent framings
  "school shooting",
  "mass shooting",
  "bomb tutorial",
  "how to make a bomb",
  "terrorist attack",
  "behead",
  "beheading",

  // Self-harm (image of the act — discussion is fine, depiction is not)
  "suicide method",
  "self-harm tutorial",
];

// Phrases that need multiple terms to be risky (e.g. "nude" alone is fine for
// fine-art contexts, but "nude [child descriptor]" is never fine).
const BLOCKED_PHRASE_PATTERNS: RegExp[] = [
  // any of {nude,naked,sexual,explicit} within 40 chars of any of
  // {child,kid,minor,teen,baby,toddler,infant,preteen,underage}
  /\b(nude|naked|sexual(?:ly)?|explicit|porn)\b[\s\S]{0,40}?\b(child(?:ren)?|kids?|minors?|teens?|baby|babies|toddlers?|infants?|preteens?|underage)\b/i,
  /\b(child(?:ren)?|kids?|minors?|teens?|baby|babies|toddlers?|infants?|preteens?|underage)\b[\s\S]{0,40}?\b(nude|naked|sexual(?:ly)?|explicit|porn)\b/i,
];

export interface ModerationResult {
  allowed: boolean;
  reason?: "minors" | "nsfw_deepfake" | "violence" | "self_harm" | "blocked_phrase";
  matchedTerm?: string;
}

/**
 * Returns `{ allowed: true }` if the prompt passes local moderation. On
 * rejection, `reason` is a stable machine-readable category — callers should
 * surface a generic message to the user rather than echoing the matched term,
 * to avoid teaching attackers which words to avoid.
 */
export function moderatePrompt(prompt: string): ModerationResult {
  if (!prompt) return { allowed: true };
  const lower = prompt.toLowerCase();

  for (const term of BLOCKED_WORDS) {
    // Word-boundary-ish match: allow the term to sit next to spaces or
    // punctuation but not be a strict substring of an unrelated word.
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(term)}([^a-z0-9]|$)`, "i");
    if (pattern.test(lower)) {
      return {
        allowed: false,
        reason: categorize(term),
        matchedTerm: term,
      };
    }
  }

  for (const rx of BLOCKED_PHRASE_PATTERNS) {
    if (rx.test(prompt)) {
      return { allowed: false, reason: "blocked_phrase" };
    }
  }

  return { allowed: true };
}

function categorize(term: string): ModerationResult["reason"] {
  if (/child|kid|loli|shota|underage|preteen|minor|school/.test(term)) return "minors";
  if (/deepfake|revenge porn|undress|nudify/.test(term)) return "nsfw_deepfake";
  if (/shoot|bomb|terror|behead/.test(term)) return "violence";
  if (/suicide|self-harm/.test(term)) return "self_harm";
  return "blocked_phrase";
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Human-readable message to show the user when their prompt is blocked. Kept
 * intentionally generic — we don't tell the user which word tripped the
 * filter so attackers can't iterate around it, but we do tell them the
 * category so they can rephrase if it was a genuine mistake.
 */
export function moderationMessage(reason: ModerationResult["reason"]): string {
  switch (reason) {
    case "minors":
      return "This prompt involves minors in a way we can't generate. Please rephrase without references to children.";
    case "nsfw_deepfake":
      return "This prompt looks like a non-consensual or deepfake request. We don't generate content of that kind.";
    case "violence":
      return "This prompt requests graphic real-world violence. Please rephrase without instructions or attack references.";
    case "self_harm":
      return "We can't generate content depicting self-harm. If you're struggling, please reach out to a local crisis line.";
    case "blocked_phrase":
    default:
      return "This prompt hit our content policy. Please rephrase and try again.";
  }
}
