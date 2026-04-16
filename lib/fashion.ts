/**
 * Pure helper functions for the Fashion Factory feature.
 * No React, no DB — these are fully unit-testable in isolation.
 */

const MAX_OUTFITS = 6;

export interface FashionShotRequest {
  prompt: string;
  model: "flux-kontext";
  mediaType: "image";
  imageUrl: string;
  aspectRatio: "1:1";
}

/**
 * Compose a single outfit-transfer prompt for flux-kontext.
 *
 * @param personUrl  - URL of the person reference image (used as imageUrl, NOT embedded in prompt)
 * @param outfitUrl  - URL of the outfit reference image (embedded in prompt)
 * @param stylePrompt - Optional style guidance from the user
 * @returns          - Composed prompt string for the edit model
 */
export function composeFashionPrompt(
  personUrl: string,
  outfitUrl: string,
  stylePrompt: string,
): string {
  const styleClause =
    stylePrompt && stylePrompt.trim().length > 0
      ? stylePrompt.trim()
      : "Studio-quality, editorial lighting";

  return (
    `Outfit transfer. Keep the person's face and body identity exactly. ` +
    `Dress them in the outfit from this reference image: ${outfitUrl}. ` +
    `${styleClause}. Studio-quality, editorial lighting, full-body shot.`
  );
}

/**
 * Build an array of FashionShotRequest payloads ready for fetch("/api/generate").
 *
 * @param personUrl  - URL of the person reference image
 * @param outfitUrls - Array of outfit reference image URLs (1–6)
 * @param stylePrompt - Optional style guidance
 * @returns          - Array of request payloads (clamped to MAX_OUTFITS)
 */
export function buildFashionBatch(
  personUrl: string,
  outfitUrls: string[],
  stylePrompt: string,
): FashionShotRequest[] {
  if (!personUrl) return [];

  const validOutfits = outfitUrls.filter((u) => u && u.trim().length > 0);
  if (validOutfits.length === 0) return [];

  if (validOutfits.length > MAX_OUTFITS) {
    throw new Error("too many outfits");
  }

  return validOutfits.map((outfitUrl) => ({
    prompt: composeFashionPrompt(personUrl, outfitUrl, stylePrompt),
    model: "flux-kontext",
    mediaType: "image",
    imageUrl: personUrl,
    aspectRatio: "1:1",
  }));
}
