/**
 * Persona service — CRUD + orchestration helpers.
 * All DB operations go through this module so routes stay thin.
 */

import { prisma } from "@/lib/db";
import { generateTriggerWord } from "./trigger-word";
import type { PersonaTier, PersonaStatus } from "@prisma/client";

export interface CreatePersonaInput {
  userId: string;
  name: string;
}

export async function createPersonaDraft(input: CreatePersonaInput) {
  const { userId, name } = input;

  // Build a URL-safe slug from the name
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  // Ensure uniqueness — append a short random suffix if needed
  const suffix = Math.random().toString(36).slice(2, 6);
  const slug = `${baseSlug}-${suffix}`;

  const triggerWord = generateTriggerWord(userId, name);

  const persona = await prisma.persona.create({
    data: {
      userId,
      name,
      slug,
      triggerWord,
      tier: "INSTANT",
      status: "DRAFT",
    },
  });

  return persona;
}

export async function getPersonaById(id: string, userId: string) {
  return prisma.persona.findFirst({
    where: { id, userId, archivedAt: null },
    include: {
      photos: { orderBy: { createdAt: "asc" } },
      attestations: { orderBy: { timestamp: "desc" }, take: 1 },
    },
  });
}

export async function listPersonas(userId: string) {
  return prisma.persona.findMany({
    where: { userId, archivedAt: null },
    include: {
      photos: { where: { isPrimary: true }, take: 1 },
      _count: { select: { generations: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deletePersona(id: string, userId: string) {
  // Collect storageKeys for external cleanup
  const photos = await prisma.personaPhoto.findMany({
    where: { personaId: id },
    select: { storageKey: true },
  });

  await prisma.persona.delete({ where: { id, userId } });

  return { deletedStorageKeys: photos.map((p) => p.storageKey) };
}

export async function updatePersonaStatus(
  id: string,
  status: PersonaStatus,
  extra?: Partial<{
    tier: PersonaTier;
    loraUrl: string;
    loraScale: number;
    trainingJobId: string;
    trainingStartedAt: Date;
    trainingEndedAt: Date;
    trainingError: string;
    primaryPhotoUrl: string;
    coverImageUrl: string;
    celebrityFlag: boolean;
    minorFlag: boolean;
  }>
) {
  return prisma.persona.update({
    where: { id },
    data: { status, ...extra },
  });
}

export async function listReadyPersonas(userId: string) {
  return prisma.persona.findMany({
    where: { userId, status: "READY", archivedAt: null },
    select: {
      id: true,
      name: true,
      tier: true,
      triggerWord: true,
      primaryPhotoUrl: true,
      coverImageUrl: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
