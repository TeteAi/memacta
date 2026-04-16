"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PersonDropzone from "./person-dropzone";
import OutfitGrid, { OutfitSlot } from "./outfit-grid";
import LookbookGrid from "./lookbook-grid";
import LookbookShareButton from "./lookbook-share-button";
import { buildFashionBatch } from "@/lib/fashion";
import { handleAuthRequired } from "@/lib/auth-redirect";
import type { ShotState } from "./lookbook-tile";

const EMPTY_OUTFIT: OutfitSlot = { preview: null, uploadedUrl: null, uploading: false };
const INITIAL_OUTFITS: OutfitSlot[] = Array.from({ length: 6 }, () => ({ ...EMPTY_OUTFIT }));

export default function FashionFactory() {
  const searchParams = useSearchParams();

  // Person slot
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [personUrl, setPersonUrl] = useState<string | null>(null);
  const [personUploading, setPersonUploading] = useState(false);

  // Outfit slots
  const [outfits, setOutfits] = useState<OutfitSlot[]>(INITIAL_OUTFITS);

  // Style prompt — seeded from ?prompt= deep-link
  const [stylePrompt, setStylePrompt] = useState("");

  // Deep-link: read ?prompt= on mount
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (promptParam) {
      setStylePrompt(promptParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generation state
  const [shots, setShots] = useState<ShotState[]>([]);
  const [generating, setGenerating] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  // Derived
  const filledOutfits = outfits.filter((o) => o.uploadedUrl || o.preview);
  const canGenerate =
    !generating &&
    personUrl !== null &&
    filledOutfits.length > 0 &&
    !outfits.some((o) => o.uploading) &&
    !personUploading;

  const outfitUrls = outfits.map((o) => o.uploadedUrl ?? o.preview ?? "");

  function updateOutfitSlot(index: number, slot: OutfitSlot) {
    setOutfits((prev) => {
      const next = [...prev];
      next[index] = slot;
      return next;
    });
  }

  async function fireShot(index: number, payload: ReturnType<typeof buildFashionBatch>[number]) {
    setShots((prev) => {
      const next = [...prev];
      next[index] = { status: "running" };
      return next;
    });

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      // Handle anon gate — only redirect once (first time we see it)
      if (handleAuthRequired(res, json)) return;

      if (json.creditsRemaining !== undefined) {
        setCreditsRemaining(json.creditsRemaining as number);
      }

      if (json.url) {
        setShots((prev) => {
          const next = [...prev];
          next[index] = { status: "succeeded", url: json.url as string };
          return next;
        });
      } else {
        setShots((prev) => {
          const next = [...prev];
          next[index] = { status: "failed", error: (json.message as string) || (json.error as string) || "Generation failed" };
          return next;
        });
      }
    } catch (e) {
      setShots((prev) => {
        const next = [...prev];
        next[index] = { status: "failed", error: (e as Error).message };
        return next;
      });
    }
  }

  async function onGenerate() {
    if (!canGenerate || !personUrl) return;
    setGenerating(true);
    setGlobalError(null);

    let batch: ReturnType<typeof buildFashionBatch>;
    try {
      batch = buildFashionBatch(personUrl, outfitUrls, stylePrompt);
    } catch (e) {
      setGlobalError((e as Error).message);
      setGenerating(false);
      return;
    }

    if (batch.length === 0) {
      setGlobalError("No outfit images provided.");
      setGenerating(false);
      return;
    }

    // Initialise all tiles as "running"
    setShots(batch.map(() => ({ status: "running" as const })));

    // Fan out concurrently; Promise.allSettled so one failure does not stop others
    await Promise.allSettled(
      batch.map((payload, idx) => fireShot(idx, payload))
    );

    setGenerating(false);
  }

  async function onRetry(index: number) {
    if (!personUrl) return;
    const outfitUrl = outfitUrls[index];
    if (!outfitUrl) return;

    const batch = buildFashionBatch(personUrl, [outfitUrl], stylePrompt);
    if (batch.length === 0) return;

    await fireShot(index, batch[0]);
  }

  const outfitLabels = outfits.map((o, i) => (o.preview ? `Outfit ${i + 1}` : `Outfit ${i + 1}`));

  return (
    <div data-testid="fashion-factory" className="mx-auto max-w-4xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/apps" className="text-white/50 hover:text-white transition-colors">
          Apps
        </Link>
        <span className="text-white/30">/</span>
        <Link href="/apps" className="text-white/50 hover:text-white transition-colors">
          Identity
        </Link>
        <span className="text-white/30">/</span>
        <span className="text-white/80">Fashion Factory</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-brand-gradient">Fashion Factory</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300 font-medium border border-fuchsia-500/20">
                  beta
                </span>
              </div>
              <p className="text-sm text-white/50 mt-0.5">
                Upload one person + up to 6 outfits and get a full lookbook
              </p>
            </div>
          </div>

          {shots.some((s) => s.status === "succeeded") && (
            <LookbookShareButton shots={shots} stylePrompt={stylePrompt} />
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* Person upload */}
        <div className="rounded-2xl bg-[#181828] border border-white/10 p-6">
          <PersonDropzone
            previewUrl={personPreview}
            uploadedUrl={personUrl}
            uploading={personUploading}
            onUploaded={(url, preview) => {
              setPersonUrl(url);
              setPersonPreview(preview);
              setPersonUploading(false);
            }}
            onClear={() => {
              setPersonPreview(null);
              setPersonUrl(null);
              setPersonUploading(false);
            }}
            onError={(msg) => {
              setGlobalError(msg);
              setPersonUploading(false);
            }}
          />
        </div>

        {/* Outfit grid */}
        <div className="rounded-2xl bg-[#181828] border border-white/10 p-6">
          <OutfitGrid
            slots={outfits}
            onSlotUpdate={updateOutfitSlot}
            onError={setGlobalError}
          />
        </div>

        {/* Style prompt */}
        <div className="rounded-2xl bg-[#181828] border border-white/10 p-6 space-y-2">
          <label className="text-white/60 text-xs font-medium block">
            Style prompt <span className="text-white/30">(optional)</span>
          </label>
          <textarea
            rows={2}
            value={stylePrompt}
            onChange={(e) => setStylePrompt(e.target.value)}
            placeholder='e.g. "studio backdrop, editorial light, fashion week aesthetic"'
            className="w-full rounded-xl border border-white/15 bg-[#1e1e32] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/30 outline-none resize-none"
            data-testid="style-prompt"
          />
        </div>

        {/* Model & cost info */}
        <div className="flex items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-xs">Model:</span>
            <span className="text-white/80 text-xs font-medium rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
              flux-kontext
            </span>
          </div>
          <div className="text-white/40 text-xs">
            Cost: 5 credits × {filledOutfits.length || "N"} outfit{filledOutfits.length !== 1 ? "s" : ""} ={" "}
            <span className="text-white/70 font-medium">{5 * filledOutfits.length} credits</span>
          </div>
        </div>

        {/* Generate button */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          data-testid="generate-lookbook-btn"
          className="w-full py-4 rounded-xl bg-brand-gradient glow-btn text-white font-bold text-base hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {generating ? "Generating Lookbook…" : "Generate Lookbook"}
        </button>

        {/* Global error */}
        {globalError && (
          <div className="rounded-xl bg-[#FE2C55]/10 border border-[#FE2C55]/20 px-4 py-3">
            <p className="text-[#FE2C55] text-sm">{globalError}</p>
          </div>
        )}

        {/* Credits remaining */}
        {creditsRemaining !== null && (
          <p className="text-center text-white/40 text-xs">
            Credits remaining: <span className="text-white/70 font-medium">{creditsRemaining}</span>
          </p>
        )}

        {/* Results grid */}
        {shots.length > 0 && (
          <div className="rounded-2xl bg-[#181828] border border-white/10 p-6 space-y-5">
            <LookbookGrid
              shots={shots}
              outfitLabels={outfitLabels}
              onRetry={onRetry}
            />

            {/* Bottom action row */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
              <LookbookShareButton
                shots={shots}
                stylePrompt={stylePrompt}
                disabled={!shots.some((s) => s.status === "succeeded")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
