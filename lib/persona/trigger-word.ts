/**
 * Deterministic trigger-word generator for Persona LoRA fine-tuning.
 *
 * Shape: `koi-<adjective>-<noun>` where adjective + noun are derived from the
 * userId + personaName so the same inputs always yield the same trigger word.
 * The "koi" prefix keeps it distinctive and prevents accidental collision with
 * natural-language tokens in prompts.
 */

import crypto from "crypto";

const ADJECTIVES = [
  "amber", "azure", "blaze", "cedar", "coral", "crimson", "dusk", "ember",
  "flint", "frost", "haze", "ivory", "jade", "lunar", "maple", "misty",
  "noble", "onyx", "opal", "prism", "raven", "rocky", "sable", "sage",
  "slate", "solar", "storm", "tawny", "thorn", "urban", "velvet", "vivid",
];

const NOUNS = [
  "arc", "bay", "bolt", "brook", "cave", "crest", "dale", "dune",
  "fern", "fjord", "gale", "glen", "glow", "grove", "isle", "knoll",
  "lake", "lark", "leaf", "mist", "moor", "peak", "pine", "rift",
  "rock", "rose", "rush", "sand", "shard", "sky", "spark", "tide",
];

function pickIndex(seed: Buffer, offset: number, listLength: number): number {
  // Read 4 bytes at offset, mod by list length
  const val = seed.readUInt32BE(offset % (seed.length - 3));
  return val % listLength;
}

/**
 * Generates a unique trigger word for a persona.
 * Deterministic: same userId + name always returns the same trigger word.
 * Format: `koi-<adjective>-<noun>` (e.g. koi-amber-arc)
 */
export function generateTriggerWord(userId: string, personaName: string): string {
  const raw = `${userId}:${personaName.toLowerCase().trim()}`;
  const hash = crypto.createHash("sha256").update(raw).digest();
  const adj = ADJECTIVES[pickIndex(hash, 0, ADJECTIVES.length)];
  const noun = NOUNS[pickIndex(hash, 4, NOUNS.length)];
  return `koi-${adj}-${noun}`;
}

/**
 * Validates that a string matches the expected trigger-word shape.
 * koi-<3-10 alpha lowercase>-<2-8 alpha lowercase>
 */
export function isValidTriggerWord(word: string): boolean {
  return /^koi-[a-z]{2,10}-[a-z]{2,8}$/.test(word);
}
