"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import PresetGrid from "./preset-grid";
import SubjectUploader from "./subject-uploader";
import SubjectInput from "./subject-input";
import ClipGrid from "./clip-grid";
import PackActions from "./pack-actions";
import { buildPopcornBatch, getPopcornPreset } from "@/lib/popcorn";
import { handleAuthRequired } from "@/lib/auth-redirect";
import type { ClipTileState } from "./clip-tile";

const DEFAULT_SEEDS: [number, number, number] = [17, 42, 91];

function getProductionSeeds(): [number, number, number] {
  const base = Date.now() % 1_000_000;
  return [base, base + 7, base + 13];
}

export default function Popcorn() {
  const [presetId, setPresetId] = useState<string | null>(null);
  const [subjectPrompt, setSubjectPrompt] = useState("");
  const [subjectPreview, setSubjectPreview] = useState<string | null>(null);
  const [subjectUrl, setSubjectUrl] = useState<string | null>(null);
  const [subjectUploading, setSubjectUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [clips, setClips] = useState<ClipTileState[]>([]);
  const [generating, setGenerating] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  // Track auth-redirect: only fire once even if 3 requests all 401
  const authRedirectedRef = useRef(false);

  const selectedPreset = presetId ? getPopcornPreset(presetId) : null;
  const hasSubject = subjectPrompt.trim().length > 0;
  const canGenerate = !generating && presetId !== null && hasSubject && !subjectUploading;

  const creditCost = selectedPreset ? 9 * 3 : 27;

  async function fireClip(
    index: number,
    payload: ReturnType<typeof buildPopcornBatch>[number],
  ) {
    setClips((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], status: "running" };
      return next;
    });

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      // Auth gate — redirect only once across all 3 concurrent calls
      if (res.status === 401 && json?.error === "auth_required") {
        if (!authRedirectedRef.current) {
          authRedirectedRef.current = true;
          handleAuthRequired(res, json);
        }
        return;
      }

      if (json.creditsRemaining !== undefined) {
        setCreditsRemaining(json.creditsRemaining as number);
      }

      if (json.url) {
        setClips((prev) => {
          const next = [...prev];
          next[index] = { seed: payload.seed, status: "succeeded", url: json.url as string };
          return next;
        });
      } else {
        setClips((prev) => {
          const next = [...prev];
          next[index] = {
            seed: payload.seed,
            status: "failed",
            error: (json.error as string) || "Generation failed",
          };
          return next;
        });
      }
    } catch (e) {
      setClips((prev) => {
        const next = [...prev];
        next[index] = {
          seed: payload.seed,
          status: "failed",
          error: (e as Error).message,
        };
        return next;
      });
    }
  }

  async function onPop() {
    if (!canGenerate || !presetId) return;
    setGenerating(true);
    setGlobalError(null);
    authRedirectedRef.current = false;

    let batch: ReturnType<typeof buildPopcornBatch>;
    try {
      const seeds = getProductionSeeds();
      batch = buildPopcornBatch(presetId, subjectPrompt, subjectUrl ?? undefined, seeds);
    } catch (e) {
      setGlobalError((e as Error).message);
      setGenerating(false);
      return;
    }

    // Initialise all 3 tiles as running immediately
    setClips(
      batch.map((p) => ({ seed: p.seed, status: "running" as const })),
    );

    // Fan out concurrently; Promise.allSettled so one failure never blocks others
    await Promise.allSettled(
      batch.map((payload, idx) => fireClip(idx, payload)),
    );

    setGenerating(false);
  }

  async function onRetry(index: number) {
    if (!presetId) return;
    const clip = clips[index];
    if (!clip) return;

    // Build a single payload with the same seed
    let batch: ReturnType<typeof buildPopcornBatch>;
    try {
      batch = buildPopcornBatch(
        presetId,
        subjectPrompt,
        subjectUrl ?? undefined,
        [clip.seed, clip.seed + 1000, clip.seed + 2000],
      );
    } catch {
      return;
    }

    await fireClip(index, batch[0]);
  }

  return (
    <div
      data-testid="popcorn"
      data-selected-preset={presetId ?? ""}
      className="mx-auto max-w-4xl px-6 py-10"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/apps" className="text-white/50 hover:text-white transition-colors">
          Apps
        </Link>
        <span className="text-white/30">/</span>
        <Link href="/apps" className="text-white/50 hover:text-white transition-colors">
          Effects
        </Link>
        <span className="text-white/30">/</span>
        <span className="text-white/80">Popcorn</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-orange-400 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-brand-gradient">Popcorn</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300 font-medium border border-fuchsia-500/20">
                beta
              </span>
            </div>
            <p className="text-sm text-white/50 mt-0.5">
              Pop out 3 short-form vertical clips from one preset
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1 — Preset */}
        <div className="rounded-2xl bg-[#181828] border border-white/10 p-6">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
            Step 1 — Pick a preset
          </h2>
          <PresetGrid selectedId={presetId} onSelect={setPresetId} />
        </div>

        {/* Step 2 — Subject */}
        <div className="rounded-2xl bg-[#181828] border border-white/10 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
            Step 2 — Subject (optional image, required description)
          </h2>
          <SubjectUploader
            previewUrl={subjectPreview}
            uploadedUrl={subjectUrl}
            uploading={subjectUploading}
            onUploaded={(url, preview) => {
              setSubjectUrl(url);
              setSubjectPreview(preview);
              setSubjectUploading(false);
              setUploadError(null);
            }}
            onClear={() => {
              setSubjectPreview(null);
              setSubjectUrl(null);
              setSubjectUploading(false);
            }}
            onError={(msg) => {
              setUploadError(msg);
              setSubjectUploading(false);
            }}
          />
          {uploadError && <p className="text-[#FE2C55] text-xs">{uploadError}</p>}
          <SubjectInput value={subjectPrompt} onChange={setSubjectPrompt} />
        </div>

        {/* Model info + CTA */}
        <div className="rounded-2xl bg-[#181828] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 text-sm text-white/50">
            <span>
              Model:{" "}
              <span className="text-white/80 font-medium">
                {selectedPreset?.model ?? "kling-25-turbo"}
              </span>
            </span>
            <span>
              Cost:{" "}
              <span className="text-white/80 font-medium">9 credits × 3 = {creditCost} credits</span>
            </span>
            {creditsRemaining !== null && (
              <span>
                Balance:{" "}
                <span className="text-white/80 font-medium">{creditsRemaining} credits</span>
              </span>
            )}
          </div>

          {globalError && (
            <p className="text-[#FE2C55] text-sm">{globalError}</p>
          )}

          <button
            type="button"
            data-testid="pop-btn"
            onClick={onPop}
            disabled={!canGenerate}
            className="w-full py-3 rounded-xl bg-brand-gradient text-white font-bold text-base glow-btn disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {generating ? "Popping…" : "POP (generate 3)"}
          </button>
        </div>

        {/* Results */}
        {clips.length > 0 && (
          <div className="rounded-2xl bg-[#181828] border border-white/10 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
              Results (9:16 vertical)
            </h2>
            <ClipGrid clips={clips} onRetry={onRetry} />
            <PackActions clips={clips} presetId={presetId} />
          </div>
        )}
      </div>
    </div>
  );
}
