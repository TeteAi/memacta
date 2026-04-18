/**
 * Celebrity name blocklist for Persona creation.
 *
 * V1: 10 hardcoded names. Matching is case+diacritic normalized and allows
 * edit-distance-1 near-matches to catch typos/obfuscation.
 *
 * All names here are illustrative placeholders — replace with the actual
 * curated list before launch. The key is the matching algorithm, not the
 * specific seed names.
 */

// V1 seed — exactly 10 names. Document for test reference.
export const BLOCKLIST_V1: string[] = [
  "taylor swift",
  "beyonce",
  "elon musk",
  "kim kardashian",
  "donald trump",
  "ariana grande",
  "tom cruise",
  "scarlett johansson",
  "cristiano ronaldo",
  "selena gomez",
];

/**
 * Normalize: lowercase, strip diacritics, collapse whitespace, remove punctuation.
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Levenshtein distance (iterative, O(n*m) space).
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export interface BlocklistMatch {
  matched: true;
  offendingName: string;
  candidate: string;
}

export interface BlocklistClear {
  matched: false;
}

export type BlocklistResult = BlocklistMatch | BlocklistClear;

/**
 * Checks whether a candidate name matches any entry in the blocklist.
 * Returns the offending entry if matched.
 *
 * Edit-distance-1 near-matches are blocked to catch "Taylorr Swift" etc.
 * However we only apply edit-distance to names of similar length (within ±2
 * chars) to avoid false positives on short common names.
 */
export function checkBlocklist(
  candidateName: string,
  blocklist: string[] = BLOCKLIST_V1
): BlocklistResult {
  const norm = normalize(candidateName);

  for (const entry of blocklist) {
    const normEntry = normalize(entry);

    // Exact match after normalization
    if (norm === normEntry) {
      return { matched: true, offendingName: entry, candidate: candidateName };
    }

    // Edit-distance-1 near-match (only for similar-length strings)
    if (Math.abs(norm.length - normEntry.length) <= 2) {
      const dist = levenshtein(norm, normEntry);
      if (dist <= 1) {
        return { matched: true, offendingName: entry, candidate: candidateName };
      }
    }

    // Substring containment — catches "Kim Kardashian West" etc.
    // The candidate must include the full blocklisted name (not just a token within it)
    // to avoid false positives on short common names like "Tom"
    if (norm.includes(normEntry)) {
      // Only flag if the blocklist entry is at least 10 chars (full name, not a word)
      if (normEntry.length >= 10) {
        return { matched: true, offendingName: entry, candidate: candidateName };
      }
    }
  }

  return { matched: false };
}
