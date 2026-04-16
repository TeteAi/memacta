"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CharacterPicker, { type CharacterOption } from "./character-picker";
import StoryForm, { type StoryFormValues } from "./story-form";
import StoryboardGrid from "./storyboard-grid";
import ReelGrid from "./reel-grid";
import ReelActions from "./reel-actions";
import { buildSoulCinemaBatch, type SoulCinemaScene } from "@/lib/soul-cinema";
import { handleAuthRequired } from "@/lib/auth-redirect";
import type { ReelTileState } from "./reel-tile";
import { videoModels } from "@/lib/ai/models";

const DEFAULT_FORM: StoryFormValues = {
  storyPrompt: "",
  genre: "drama",
  tone: "moody",
  sceneCount: 3,
  model: videoModels()[0]?.id ?? "kling-3",
  aspectRatio: "16:9",
};

const VALID_GENRES = ["drama", "noir", "scifi", "romance", "action"] as const;

export default function SoulCinema() {
  const searchParams = useSearchParams();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterOption | null>(null);
  const [formValues, setFormValues] = useState<StoryFormValues>(DEFAULT_FORM);

  // Deep-link: read ?story= and ?genre= on mount
  useEffect(() => {
    const storyParam = searchParams.get("story");
    const genreParam = searchParams.get("genre");
    if (storyParam || genreParam) {
      setFormValues((prev) => ({
        ...prev,
        ...(storyParam ? { storyPrompt: storyParam } : {}),
        ...(genreParam && (VALID_GENRES as readonly string[]).includes(genreParam)
          ? { genre: genreParam as typeof VALID_GENRES[number] }
          : {}),
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [scenes, setScenes] = useState<SoulCinemaScene[]>([]);
  const [storyboardLoading, setStoryboardLoading] = useState(false);
  const [storyboardSeed, setStoryboardSeed] = useState(42);
  const [tiles, setTiles] = useState<ReelTileState[]>([]);
  const [generating, setGenerating] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Conditions for enabling generate button
  const hasCharacter = selectedCharacter !== null;
  const hasStory = formValues.storyPrompt.length >= 10;
  const hasStoryboard = scenes.length >= 3;
  const canGenerate = hasCharacter && hasStory && hasStoryboard && !generating;

  const creditsNeeded = formValues.sceneCount * 3;

  // Auto-generate storyboard when form changes (debounced 400ms)
  const fetchStoryboard = useCallback(
    async (values: StoryFormValues, charName: string, seed: number) => {
      if (values.storyPrompt.length < 10) {
        setScenes([]);
        return;
      }
      setStoryboardLoading(true);
      try {
        const res = await fetch("/api/soul-cinema/script", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            storyPrompt: values.storyPrompt,
            sceneCount: values.sceneCount,
            genre: values.genre,
            tone: values.tone,
            characterName: charName || "Character",
            seed,
          }),
        });
        const json = await res.json();
        if (json.scenes) {
          setScenes(json.scenes);
        }
      } catch {
        // silently fail
      } finally {
        setStoryboardLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchStoryboard(
        formValues,
        selectedCharacter?.name ?? "Character",
        storyboardSeed
      );
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formValues, selectedCharacter, storyboardSeed, fetchStoryboard]);

  function onRegenerateBeats() {
    setStoryboardSeed((prev) => prev + Math.floor(Math.random() * 100) + 1);
  }

  async function fireScene(
    index: number,
    payload: ReturnType<typeof buildSoulCinemaBatch>[number]
  ) {
    setTiles((prev) => {
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

      if (handleAuthRequired(res, json)) return;

      if (json.url || json.status === "succeeded") {
        setTiles((prev) => {
          const next = [...prev];
          next[index] = { status: "succeeded", url: json.url as string };
          return next;
        });
      } else {
        setTiles((prev) => {
          const next = [...prev];
          next[index] = {
            status: "failed",
            error: (json.message as string) || (json.error as string) || "Generation failed",
          };
          return next;
        });
      }
    } catch (e) {
      setTiles((prev) => {
        const next = [...prev];
        next[index] = { status: "failed", error: (e as Error).message };
        return next;
      });
    }
  }

  async function onGenerate() {
    if (!canGenerate || !selectedCharacter) return;
    setGenerating(true);
    setGlobalError(null);

    let batch: ReturnType<typeof buildSoulCinemaBatch>;
    try {
      batch = buildSoulCinemaBatch({
        scenes,
        model: formValues.model,
        aspectRatio: formValues.aspectRatio,
        characterRefUrl: selectedCharacter.refImageUrl || undefined,
        durationSec: 5,
      });
    } catch (e) {
      setGlobalError((e as Error).message);
      setGenerating(false);
      return;
    }

    if (batch.length === 0) {
      setGlobalError("No scenes to generate.");
      setGenerating(false);
      return;
    }

    // Initialize all tiles as running
    setTiles(batch.map(() => ({ status: "running" as const })));

    // Fan out concurrently; Promise.allSettled so one failure does not stop others
    await Promise.allSettled(batch.map((payload, idx) => fireScene(idx, payload)));

    setGenerating(false);
  }

  async function onRetry(index: number) {
    if (!selectedCharacter) return;
    const scene = scenes[index];
    if (!scene) return;

    try {
      const batch = buildSoulCinemaBatch({
        scenes: [scene],
        model: formValues.model,
        aspectRatio: formValues.aspectRatio,
        characterRefUrl: selectedCharacter.refImageUrl || undefined,
        durationSec: 5,
      });
      if (batch.length === 0) return;
      await fireScene(index, batch[0]);
    } catch (e) {
      setTiles((prev) => {
        const next = [...prev];
        next[index] = { status: "failed", error: (e as Error).message };
        return next;
      });
    }
  }

  const showReel = tiles.length > 0;

  return (
    <main data-testid="soul-cinema-page" className="mx-auto max-w-4xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/apps" className="text-white/50 hover:text-white transition-colors">
          Cinema
        </Link>
        <span className="text-white/30">/</span>
        <span className="text-white/80">Soul Cinema</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/20 flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-brand-gradient">Soul Cinema</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300 font-medium border border-fuchsia-500/20">
                beta
              </span>
            </div>
            <p className="text-sm text-white/50 mt-0.5">
              Turn a story beat into a character-driven reel.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Step 1: Pick character */}
        <section className="rounded-2xl bg-[#181828] border border-white/10 p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            Step 1 — Pick your character
          </h2>
          <CharacterPicker
            selectedId={selectedCharacter?.id ?? null}
            onSelect={setSelectedCharacter}
          />
        </section>

        {/* Step 2: Tell the story */}
        <section className="rounded-2xl bg-[#181828] border border-white/10 p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            Step 2 — Tell the story
          </h2>
          <StoryForm values={formValues} onChange={setFormValues} />
        </section>

        {/* Step 3: Storyboard */}
        <section className="rounded-2xl bg-[#181828] border border-white/10 p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            Step 3 — Storyboard
          </h2>
          <StoryboardGrid
            scenes={scenes}
            loading={storyboardLoading}
            onRegenerate={onRegenerateBeats}
          />

          {/* Generate reel button */}
          <div className="mt-5">
            <button
              type="button"
              data-testid="generate-reel-btn"
              onClick={onGenerate}
              disabled={!canGenerate}
              className="w-full py-4 rounded-xl bg-brand-gradient glow-btn text-white font-bold text-base hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generating
                ? "Generating reel…"
                : `Generate reel — ${creditsNeeded} credits`}
            </button>

            {/* Helper hints */}
            {!hasCharacter && (
              <p className="text-white/30 text-xs mt-2 text-center">Select a character to continue</p>
            )}
            {hasCharacter && !hasStory && (
              <p className="text-white/30 text-xs mt-2 text-center">Enter at least 10 characters of story</p>
            )}
            {hasCharacter && hasStory && !hasStoryboard && (
              <p className="text-white/30 text-xs mt-2 text-center">Generating storyboard…</p>
            )}
          </div>
        </section>

        {/* Global error */}
        {globalError && (
          <div className="rounded-xl bg-[#FE2C55]/10 border border-[#FE2C55]/20 px-4 py-3">
            <p className="text-[#FE2C55] text-sm">{globalError}</p>
          </div>
        )}

        {/* Step 4: Reel */}
        {showReel && (
          <section className="rounded-2xl bg-[#181828] border border-white/10 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Step 4 — Your reel
            </h2>

            <ReelGrid tiles={tiles} scenes={scenes} onRetry={onRetry} />

            {tiles.some((t) => t.status === "succeeded") && (
              <ReelActions
                tiles={tiles}
                scenes={scenes}
                model={formValues.model}
                genre={formValues.genre}
                storyPrompt={formValues.storyPrompt}
              />
            )}
          </section>
        )}
      </div>
    </main>
  );
}
