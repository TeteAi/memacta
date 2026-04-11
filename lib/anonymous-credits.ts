export const ANON_MAX_GENERATIONS = 1;
export const ANON_COOKIE_NAME = "memacta_anon_gens";

export function getAnonGenerationCount(cookieValue: string | undefined): number {
  if (!cookieValue) return 0;
  const parsed = parseInt(cookieValue, 10);
  if (isNaN(parsed) || parsed < 0) return 0;
  return parsed;
}

export function incrementAnonGenerationCount(currentCount: number): string {
  return String(currentCount + 1);
}
