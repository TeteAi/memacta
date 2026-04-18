/**
 * Consent attestation helpers for Persona photo consent.
 *
 * contentHash = sha256 over sorted storageKeys joined by '|'
 * This makes it deterministic and order-insensitive — the same set of
 * photos always produces the same hash, regardless of upload order.
 */

import crypto from "crypto";
import { prisma } from "@/lib/db";

export const CONSENT_STATEMENT_VERSION = "v1-2026-04";

/**
 * Computes the canonical content hash for a set of storage keys.
 * Order-insensitive: keys are sorted before hashing.
 */
export function computeContentHash(storageKeys: string[]): string {
  if (storageKeys.length === 0) {
    throw new Error("Cannot compute content hash from empty storage keys");
  }
  const sorted = [...storageKeys].sort();
  const payload = sorted.join("|");
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export interface AttestationInput {
  userId: string;
  personaId: string;
  storageKeys: string[];
  statementVersion?: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Persists a consent attestation to the database.
 * Must be called BEFORE any training or generation that uses the persona photos.
 * Fail-closed: throws on any missing/invalid input.
 */
export async function persistAttestation(input: AttestationInput) {
  const version = input.statementVersion ?? CONSENT_STATEMENT_VERSION;

  if (!version || version.trim() === "") {
    throw new Error("statementVersion must not be empty");
  }

  const contentHash = computeContentHash(input.storageKeys);

  const attestation = await prisma.consentAttestation.create({
    data: {
      userId: input.userId,
      personaId: input.personaId,
      statementVersion: version,
      contentHash,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });

  return { attestation, contentHash };
}

/**
 * Verifies that a valid attestation exists for the given persona and contentHash.
 * Returns the most recent matching attestation or null.
 */
export async function findAttestation(personaId: string, contentHash: string) {
  return prisma.consentAttestation.findFirst({
    where: { personaId, contentHash },
    orderBy: { timestamp: "desc" },
  });
}
