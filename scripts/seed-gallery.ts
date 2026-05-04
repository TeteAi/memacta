/**
 * scripts/seed-gallery.ts
 *
 * Generates showcase Generation rows attributed to a synthetic system user.
 * Each row is marked isPublic=true so the gallery can surface them.
 *
 * USAGE:
 *   tsx scripts/seed-gallery.ts --confirm
 *
 * DO NOT run without --confirm. This script makes real fal.ai API calls
 * and costs real money. Each image generation costs approximately $0.003–$0.01
 * depending on the model selected.
 *
 * The script is idempotent: it skips any prompt+persona combination that
 * already has a completed Generation row in the DB.
 */

import { PrismaClient } from "@prisma/client";
import { fal } from "@fal-ai/client";

// ─── Cost estimate ────────────────────────────────────────────────────────────
const COST_PER_IMAGE_USD = 0.008; // conservative mid-range estimate

// ─── Seed configuration ───────────────────────────────────────────────────────
// Operators: fill in real personaId values after the Personas exist in the DB.
const SEED_ITEMS: Array<{
  personaId: string | null; // null = no persona (base model only)
  prompt: string;
  model: string;
  count: number;
}> = [
  {
    personaId: null,
    prompt: "Ultra-realistic portrait of a young woman with neon-lit city background, cinematic lighting, 4K",
    model: "fal-ai/flux/dev",
    count: 3,
  },
  {
    personaId: null,
    prompt: "Futuristic fashion editorial, holographic fabrics, dramatic studio lighting, magazine quality",
    model: "fal-ai/flux/dev",
    count: 3,
  },
  {
    personaId: null,
    prompt: "AI influencer posing in a rooftop garden, golden hour, lifestyle photography",
    model: "fal-ai/flux/dev",
    count: 3,
  },
  {
    personaId: null,
    prompt: "Cyberpunk street scene, rain-slicked pavement, neon signs reflected, atmospheric",
    model: "fal-ai/flux/dev",
    count: 3,
  },
  {
    personaId: null,
    prompt: "Minimalist product shot, luxury perfume bottle on marble, soft shadows, commercial",
    model: "fal-ai/flux/dev",
    count: 3,
  },
  {
    personaId: null,
    prompt: "Abstract AI art, fractal geometry meets organic forms, vivid magenta and cyan palette",
    model: "fal-ai/flux/dev",
    count: 2,
  },
];

const SYSTEM_USER_ID = "memacta-system-seed-user";
const SYSTEM_USER_EMAIL = "system-seed@memacta.internal";

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  if (!args.includes("--confirm")) {
    const totalImages = SEED_ITEMS.reduce((acc, item) => acc + item.count, 0);
    const estimatedCost = (totalImages * COST_PER_IMAGE_USD).toFixed(2);
    console.error(`
╔══════════════════════════════════════════════════════════════╗
║                  memacta Gallery Seed Script                 ║
╚══════════════════════════════════════════════════════════════╝

  This script will generate approximately ${totalImages} images.
  Estimated cost: ~$${estimatedCost} USD (at ~$${COST_PER_IMAGE_USD}/image)

  This uses the REAL fal.ai API and REAL money.

  To proceed, re-run with the --confirm flag:
    tsx scripts/seed-gallery.ts --confirm

  Exiting without making any API calls.
`);
    process.exit(0);
  }

  const db = new PrismaClient();

  try {
    // Configure fal
    const falApiKey = process.env.FAL_KEY ?? process.env.FAL_API_KEY;
    if (!falApiKey) {
      throw new Error("FAL_KEY or FAL_API_KEY env var is required");
    }
    fal.config({ credentials: falApiKey });

    // Upsert the system seed user
    const systemUser = await db.user.upsert({
      where: { email: SYSTEM_USER_EMAIL },
      create: {
        id: SYSTEM_USER_ID,
        email: SYSTEM_USER_EMAIL,
        name: "memacta Gallery",
        credits: 0,
      },
      update: {},
    });

    console.log(`System user: ${systemUser.id}`);

    let generated = 0;
    let skipped = 0;

    for (const item of SEED_ITEMS) {
      for (let i = 0; i < item.count; i++) {
        const prompt = `${item.prompt} (variant ${i + 1})`;

        // Idempotency check — skip if already done
        const existing = await db.generation.findFirst({
          where: {
            userId: SYSTEM_USER_ID,
            prompt,
            status: "completed",
            ...(item.personaId ? { personaId: item.personaId } : {}),
          },
        });

        if (existing) {
          console.log(`  SKIP (exists): ${prompt.slice(0, 60)}...`);
          skipped++;
          continue;
        }

        console.log(`  GENERATING [${item.model}]: ${prompt.slice(0, 60)}...`);

        let resultUrl: string | null = null;
        let error: string | null = null;

        try {
          const result = await fal.run(item.model, {
            input: {
              prompt,
              image_size: "portrait_4_3",
              num_inference_steps: 28,
              num_images: 1,
              ...(item.personaId
                ? {
                    loras: [{ path: item.personaId, scale: 0.85 }],
                  }
                : {}),
            },
          }) as { images?: Array<{ url: string }> };

          resultUrl = result?.images?.[0]?.url ?? null;
        } catch (err) {
          error = err instanceof Error ? err.message : String(err);
          console.error(`  ERROR: ${error}`);
        }

        await db.generation.create({
          data: {
            userId: SYSTEM_USER_ID,
            model: item.model,
            mediaType: "image",
            prompt,
            status: resultUrl ? "completed" : "failed",
            resultUrl,
            error,
            isPublic: true,
            ...(item.personaId ? { personaId: item.personaId } : {}),
          },
        });

        generated++;
        console.log(`  OK: ${resultUrl ?? "failed"}`);

        // Small delay to avoid hammering the API
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    console.log(`\nDone. Generated: ${generated}, Skipped (already existed): ${skipped}`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
