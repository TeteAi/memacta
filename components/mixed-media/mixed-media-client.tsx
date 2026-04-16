"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import StylePresetGrid from "./style-preset-grid";
import SubjectPanel from "./subject-panel";
import OutputSettings from "./output-settings";
import GenerateButton from "./generate-button";
import LookbookGrid from "./lookbook-grid";
import type { MixedMediaResult } from "./mixed-media-tile";
import {
  buildMixedMediaBatch,
  buildMixedMediaBlends,
  MIXED_MEDIA_STYLES,
  MixedMediaIncompatibleMediaError,
} from "@/lib/mixed-media";
import { handleAuthRequired } from "@/lib/auth-redirect";

export default function MixedMediaClient() {
  const searchParams = useSearchParams();

  const [selectedStyleIds, setSelectedStyleIds] = useState<string[]>([]);
  const [subjectPrompt, setSubjectPrompt] = useState("");
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [variationsPerBlend, setVariationsPerBlend] = useState<1 | 2 | 3>(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<MixedMediaResult[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const authRedirectedRef = useRef(false);

  // Deep-link: ?preset=<id>&subject=<text>
  useEffect(() => {
    const presetParam = searchParams.get("preset");
    const subjectParam = searchParams.get("subject");
    if (presetParam) {
      const valid = MIXED_MEDIA_STYLES.find((s) => s.id === presetParam);
      if (valid) setSelectedStyleIds([presetParam]);
    }
    if (subjectParam) {
      setSubjectPrompt(subjectParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if any selected style is incompatible with current mediaType
  const incompatibleIds = selectedStyleIds.filter((id) => {
    const style = MIXED_MEDIA_STYLES.find((s) => s.id === id);
    return style && !style.compatibleMedia.includes(mediaType);
  });
  const isIncompatible = incompatibleIds.length > 0;

  function toggleStyle(id: string) {
    setSelectedStyleIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id);
      }
      if (prev.length >= 3) return prev; // cap at 3
      return [...prev, id];
    });
  }

  async function fireRequest(
    idx: number,
    req: ReturnType<typeof buildMixedMediaBatch>[number],
    styleNames: string[],
  ) {
    setResults((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        status: "running",
        blendId: req.blendId,
        variationIndex: req.variationIndex,
        mediaType: req.mediaType,
        styleNames,
      };
      return next;
    });

    try {
      const body: Record<string, unknown> = {
        prompt: req.prompt,
        model: req.model,
        mediaType: req.mediaType,
        aspectRatio: req.aspectRatio,
      };
      if (req.imageUrl) body.imageUrl = req.imageUrl;
      if (req.duration) body.duration = req.duration;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (res.status === 401 && json?.error === "auth_required") {
        if (!authRedirectedRef.current) {
          authRedirectedRef.current = true;
          handleAuthRequired(res, json);
        }
        return;
      }

      if (json.url || json.mediaUrl) {
        const mediaUrl = (json.url ?? json.mediaUrl) as string;
        setResults((prev) => {
          const next = [...prev];
          next[idx] = {
            blendId: req.blendId,
            variationIndex: req.variationIndex,
            status: "succeeded",
            mediaUrl,
            mediaType: req.mediaType,
            styleNames,
          };
          return next;
        });
      } else {
        setResults((prev) => {
          const next = [...prev];
          next[idx] = {
            blendId: req.blendId,
            variationIndex: req.variationIndex,
            status: "failed",
            error: (json.message as string) || (json.error as string) || "Generation failed",
            mediaType: req.mediaType,
            styleNames,
          };
          return next;
        });
      }
    } catch (e) {
      setResults((prev) => {
        const next = [...prev];
        next[idx] = {
          blendId: req.blendId,
          variationIndex: req.variationIndex,
          status: "failed",
          error: (e as Error).message,
          mediaType: req.mediaType,
          styleNames,
        };
        return next;
      });
    }
  }

  async function onGenerate() {
    if (isGenerating || isIncompatible) return;
    if (selectedStyleIds.length < 2 || !subjectPrompt.trim()) return;

    setIsGenerating(true);
    setGlobalError(null);
    authRedirectedRef.current = false;

    let batch: ReturnType<typeof buildMixedMediaBatch>;
    let blendStyleNames: string[];

    try {
      batch = buildMixedMediaBatch({
        selectedStyleIds,
        subjectPrompt,
        referenceUrl: referenceUrl ?? undefined,
        mediaType,
        aspectRatio,
        variationsPerBlend,
      });
      const blends = buildMixedMediaBlends(selectedStyleIds);
      blendStyleNames = blends[0]?.styleNames ?? [];
    } catch (e) {
      if (e instanceof MixedMediaIncompatibleMediaError) {
        setGlobalError(e.message);
      } else {
        setGlobalError((e as Error).message);
      }
      setIsGenerating(false);
      return;
    }

    // Initialise all tiles as running
    setResults(
      batch.map((req) => ({
        blendId: req.blendId,
        variationIndex: req.variationIndex,
        status: "pending" as const,
        mediaType: req.mediaType,
        styleNames: blendStyleNames,
      })),
    );

    await Promise.allSettled(
      batch.map((req, idx) => fireRequest(idx, req, blendStyleNames)),
    );

    setIsGenerating(false);
  }

  async function onRetry(blendId: string, variationIndex: number) {
    const idx = results.findIndex(
      (r) => r.blendId === blendId && r.variationIndex === variationIndex,
    );
    if (idx === -1) return;

    let batch: ReturnType<typeof buildMixedMediaBatch>;
    let blendStyleNames: string[];

    try {
      batch = buildMixedMediaBatch({
        selectedStyleIds,
        subjectPrompt,
        referenceUrl: referenceUrl ?? undefined,
        mediaType,
        aspectRatio,
        variationsPerBlend,
      });
      const blends = buildMixedMediaBlends(selectedStyleIds);
      blendStyleNames = blends[0]?.styleNames ?? [];
    } catch {
      return;
    }

    const req = batch.find(
      (r) => r.blendId === blendId && r.variationIndex === variationIndex,
    );
    if (!req) return;

    await fireRequest(idx, req, blendStyleNames);
  }

  const selectedNames = selectedStyleIds
    .map((id) => MIXED_MEDIA_STYLES.find((s) => s.id === id)?.name ?? id)
    .join(" x ");

  return (
    <main
      data-testid="mixed-media-page"
      className="mx-auto max-w-4xl px-6 py-10"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/apps" className="text-white/50 hover:text-white transition-colors">
          Apps
        </Link>
        <span className="text-white/30">/</span>
        <span className="text-white/80">Mixed Media</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-brand-gradient">Mixed Media Studio</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300 font-medium border border-fuchsia-500/20">
                beta
              </span>
            </div>
            <p className="text-sm text-white/50 mt-0.5">
              Blend aesthetic styles into one striking shot.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1 — Style selection */}
        <div className="rounded-2xl bg-[#181828] border border-white/15 p-6">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-1">
            Step 1 — Pick 2–3 styles to blend
          </h2>
          <p className="text-xs text-white/40 mb-4">
            {selectedStyleIds.length}/3 selected
            {selectedStyleIds.length < 2 && " — select at least 2"}
          </p>
          <StylePresetGrid selectedIds={selectedStyleIds} onToggle={toggleStyle} />
        </div>

        {/* Step 2 — Subject */}
        <div className="rounded-2xl bg-[#181828] border border-white/15 p-6">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
            Step 2 — Subject
          </h2>
          <SubjectPanel
            subjectPrompt={subjectPrompt}
            onSubjectChange={setSubjectPrompt}
            referenceUrl={referenceUrl}
            onReferenceUploaded={setReferenceUrl}
            onReferenceClear={() => setReferenceUrl(null)}
          />
        </div>

        {/* Step 3 — Output settings */}
        <div className="rounded-2xl bg-[#181828] border border-white/15 p-6">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
            Step 3 — Output
          </h2>
          <OutputSettings
            mediaType={mediaType}
            onMediaTypeChange={setMediaType}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            variationsPerBlend={variationsPerBlend}
            onVariationsChange={setVariationsPerBlend}
          />
        </div>

        {/* Preview + CTA */}
        <div className="rounded-2xl bg-[#181828] border border-white/15 p-6 space-y-4">
          {selectedStyleIds.length >= 2 && (
            <p className="text-sm text-white/50">
              Preview:{" "}
              <span className="text-white/80">
                &quot;{selectedNames}
                {subjectPrompt.trim() ? ` + ${subjectPrompt.trim().slice(0, 40)}...` : ""}&quot;
              </span>
            </p>
          )}

          {globalError && (
            <p className="text-sm text-red-400">{globalError}</p>
          )}

          <GenerateButton
            selectedStyleIds={selectedStyleIds}
            subjectPrompt={subjectPrompt}
            mediaType={mediaType}
            variationsPerBlend={variationsPerBlend}
            isGenerating={isGenerating}
            isIncompatible={isIncompatible}
            onClick={onGenerate}
          />
        </div>

        {/* Lookbook */}
        {results.length > 0 && (
          <div className="rounded-2xl bg-[#181828] border border-white/15 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
              Lookbook
            </h2>
            <LookbookGrid results={results} onRetry={onRetry} />
          </div>
        )}
      </div>
    </main>
  );
}
