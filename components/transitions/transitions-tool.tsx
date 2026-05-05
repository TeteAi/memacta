"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ShareButton from "@/components/social/share-button";
import { smartDownload } from "@/lib/download";
import WatermarkHint from "@/components/watermark-hint";
import { handleAuthRequired } from "@/lib/auth-redirect";

type ClipKind = "video" | "image";

type ClipState = {
  preview: string | null;
  uploadedUrl: string | null;
  uploading: boolean;
  kind: ClipKind | null;
};

type GenStep =
  | "idle"
  | "extracting"
  | "generating"
  | "stitching"
  | "done"
  | "error";

type Preset = {
  id: string;
  name: string;
  description: string;
  icon: string;
  promptFragment: string;
  badge?: "popular" | "new";
};

const PRESETS: Preset[] = [
  {
    id: "smooth-fade",
    name: "Smooth Fade",
    description: "Classic cross-dissolve",
    icon: "🌫️",
    promptFragment: "smooth cinematic cross-dissolve between two scenes, soft and elegant",
  },
  {
    id: "whip-pan",
    name: "Whip Pan",
    description: "Fast horizontal blur",
    icon: "💨",
    promptFragment:
      "fast whip pan transition with motion blur, camera snaps from one scene to the next",
    badge: "popular",
  },
  {
    id: "zoom-punch",
    name: "Zoom Punch",
    description: "Aggressive forward zoom",
    icon: "🥊",
    promptFragment:
      "punchy zoom-in transition with radial motion blur, accelerating into the next shot",
    badge: "popular",
  },
  {
    id: "spin-360",
    name: "360 Spin",
    description: "Dynamic camera rotation",
    icon: "🌀",
    promptFragment:
      "fast 360-degree camera spin transition with motion blur, ending on the next scene",
  },
  {
    id: "glitch",
    name: "Glitch",
    description: "Digital chromatic glitch",
    icon: "⚡",
    promptFragment:
      "RGB chromatic aberration glitch transition, datamosh tear, digital distortion",
    badge: "popular",
  },
  {
    id: "light-leak",
    name: "Light Leak",
    description: "Cinematic flash burst",
    icon: "✨",
    promptFragment:
      "warm orange light-leak flash transition, anamorphic lens flare burst between scenes",
  },
  {
    id: "match-cut",
    name: "Match Cut",
    description: "Shape-matched seamless edit",
    icon: "🎬",
    promptFragment:
      "seamless match cut transition, matching shapes and motion lines between scenes",
    badge: "new",
  },
  {
    id: "slide-left",
    name: "Slide Left",
    description: "Push horizontal slide",
    icon: "⬅️",
    promptFragment:
      "push-style slide transition, the second scene slides in from the right",
  },
  {
    id: "slide-up",
    name: "Slide Up",
    description: "Push vertical slide",
    icon: "⬆️",
    promptFragment:
      "vertical slide transition, the second scene slides up from below",
  },
  {
    id: "camera-shake",
    name: "Camera Shake",
    description: "Energetic handheld snap",
    icon: "📹",
    promptFragment:
      "energetic handheld camera shake transition, fast cuts with motion blur",
  },
  {
    id: "ink-bleed",
    name: "Ink Bleed",
    description: "Liquid ink wipe",
    icon: "🖋️",
    promptFragment:
      "ink bleed transition, fluid black ink spreading across the frame revealing the next scene",
    badge: "new",
  },
  {
    id: "page-turn",
    name: "Page Turn",
    description: "Paper page flip",
    icon: "📖",
    promptFragment: "page-turn transition, paper folding away to reveal the next scene",
  },
];

const MAX_BYTES = 30 * 1024 * 1024; // 30 MB ceiling for clips

function ClipDropzone({
  label,
  state,
  onPicked,
  onClear,
  onError,
}: {
  label: string;
  state: ClipState;
  onPicked: (file: File) => void;
  onClear: () => void;
  onError: (msg: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      onError("Clip too large — keep it under 30 MB.");
      return;
    }
    if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) {
      onError("Use a video clip (.mp4 / .mov) or image (.jpg / .png).");
      return;
    }
    onPicked(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">{label}</label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !state.preview && inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-5 text-center transition-all ${
          dragOver
            ? "border-fuchsia-500/60 bg-fuchsia-500/10"
            : "border-white/20 hover:border-fuchsia-500/40 bg-[#1e1e32]"
        } ${!state.preview ? "cursor-pointer" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {state.preview ? (
          <div className="space-y-2">
            {state.preview.startsWith("blob:") || state.preview.endsWith(".mp4") || state.preview.endsWith(".mov") || state.preview.endsWith(".webm") ? (
              <video
                src={state.preview}
                className="max-h-32 mx-auto rounded-lg border border-white/15 object-contain"
                controls
                muted
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={state.preview}
                alt={`${label} preview`}
                className="max-h-32 mx-auto rounded-lg border border-white/15 object-contain"
              />
            )}
            <p className="text-xs text-white/60">
              {state.uploading ? "Uploading…" : state.uploadedUrl ? "Ready" : "Loaded"}
            </p>
            {state.uploading && (
              <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-fuchsia-500 animate-pulse w-1/2" />
              </div>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-xs text-[#FE2C55] hover:text-red-300 transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2 py-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-white/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <p className="text-sm text-white/70">
              <span className="text-fuchsia-300 font-medium">Click to upload</span>{" "}
              or drag &amp; drop
            </p>
            <p className="text-xs text-white/40">
              MP4 / MOV / WebM or PNG / JPG · up to 30 MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type ProgressState = "pending" | "active" | "done" | "skip";

const STEP_ORDER: GenStep[] = ["extracting", "generating", "stitching", "done"];

function stepIndex(current: GenStep, target: GenStep): ProgressState {
  if (current === "idle" || current === "error") return "pending";
  const ci = STEP_ORDER.indexOf(current);
  const ti = STEP_ORDER.indexOf(target);
  if (ti === -1) return "pending";
  if (ci > ti) return "done";
  if (ci === ti) return "active";
  return "pending";
}

function ProgressRow({
  label,
  state,
  skipText,
}: {
  label: string;
  state: ProgressState;
  skipText?: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
        {state === "active" ? (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-fuchsia-500 border-t-transparent animate-spin" />
        ) : state === "done" ? (
          <svg
            className="w-4 h-4 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.4}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        ) : state === "skip" ? (
          <span className="w-2 h-2 rounded-full bg-white/20" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-white/30" />
        )}
      </div>
      <span
        className={`flex-1 ${
          state === "done"
            ? "text-white/80"
            : state === "active"
            ? "text-white"
            : state === "skip"
            ? "text-white/30 line-through"
            : "text-white/45"
        }`}
      >
        {label}
        {state === "skip" && skipText && (
          <span className="text-white/30 no-underline ml-2 italic">
            ({skipText})
          </span>
        )}
      </span>
    </div>
  );
}

export default function TransitionsTool() {
  const { data: sessionData } = useSession();
  const planId =
    (sessionData?.user as { planId?: string } | undefined)?.planId ?? "free";

  const [clipA, setClipA] = useState<ClipState>({
    preview: null,
    uploadedUrl: null,
    uploading: false,
    kind: null,
  });
  const [clipB, setClipB] = useState<ClipState>({
    preview: null,
    uploadedUrl: null,
    uploading: false,
    kind: null,
  });
  const [presetId, setPresetId] = useState<string>("whip-pan");
  const [override, setOverride] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<GenStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const preset = PRESETS.find((p) => p.id === presetId);
  const willStitch = clipA.kind === "video" && clipB.kind === "video";

  async function uploadClip(file: File, which: "a" | "b") {
    const setter = which === "a" ? setClipA : setClipB;
    const preview = URL.createObjectURL(file);
    const kind: ClipKind = file.type.startsWith("video/") ? "video" : "image";
    setter({ preview, uploadedUrl: null, uploading: true, kind });

    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (handleAuthRequired(res, json)) return;
      if (!res.ok) {
        setError(json.error || "Upload failed.");
        setter({ preview, uploadedUrl: null, uploading: false, kind });
        return;
      }
      setter({ preview, uploadedUrl: json.url, uploading: false, kind });
    } catch (e) {
      setError((e as Error).message);
      setter({ preview, uploadedUrl: null, uploading: false, kind });
    }
  }

  function clear(which: "a" | "b") {
    const setter = which === "a" ? setClipA : setClipB;
    setter({ preview: null, uploadedUrl: null, uploading: false, kind: null });
  }

  /** Upload an arbitrary Blob (e.g. an extracted frame) and return its URL. */
  async function uploadBlob(blob: Blob, filename: string): Promise<string> {
    const form = new FormData();
    form.append("file", new File([blob], filename, { type: blob.type }));
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `Upload failed: ${res.status}`);
    return json.url as string;
  }

  async function onGenerate() {
    setError(null);
    setResult(null);
    if (!preset) {
      setError("Pick a transition preset first.");
      return;
    }
    if (!clipA.uploadedUrl || !clipA.kind) {
      setError("Upload Clip A first.");
      return;
    }
    setLoading(true);
    setStep("idle");

    try {
      // ─── 1. Pick the AI's starting frame ──────────────────────────────
      // Video → extract last frame and upload it.
      // Image → use the uploaded URL directly.
      let startFrameUrl: string;
      if (clipA.kind === "video") {
        setStep("extracting");
        const { extractFrame } = await import("@/lib/video-stitch");
        const frame = await extractFrame(clipA.uploadedUrl, "last");
        startFrameUrl = await uploadBlob(frame, `clipA-last-${Date.now()}.jpg`);
      } else {
        startFrameUrl = clipA.uploadedUrl;
      }

      // ─── 2. Generate the AI middle ────────────────────────────────────
      setStep("generating");
      const promptParts = [
        `[Transition: ${preset.name}]`,
        preset.promptFragment,
      ];
      if (override.trim()) {
        promptParts.push(`Custom direction: ${override.trim()}`);
      }
      if (clipB.uploadedUrl) {
        promptParts.push(
          `End on a scene that matches this reference: ${clipB.uploadedUrl}.`
        );
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: promptParts.join(" "),
          model: "kling-3",
          mediaType: "video",
          imageUrl: startFrameUrl,
          aspectRatio: "9:16",
        }),
      });
      const data = await res.json();
      if (handleAuthRequired(res, data)) return;
      if (!res.ok) {
        throw new Error(data.message || data.error || "Generation failed.");
      }
      const middleUrl: string | null = data.url ?? data.result ?? null;
      if (!middleUrl) throw new Error("AI returned no video URL.");

      // ─── 3. Stitch (only when both clips are real videos) ─────────────
      if (clipA.kind === "video" && clipB.kind === "video" && clipB.uploadedUrl) {
        setStep("stitching");
        const { concatVideos } = await import("@/lib/video-stitch");
        const finalBlob = await concatVideos([
          clipA.uploadedUrl,
          middleUrl,
          clipB.uploadedUrl,
        ]);
        const finalObjUrl = URL.createObjectURL(finalBlob);
        setResult(finalObjUrl);
      } else {
        // Fallback: just show the AI middle (no real footage to splice).
        setResult(middleUrl);
      }
      setStep("done");
    } catch (e) {
      setStep("error");
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-testid="transitions-tool" className="space-y-6">
      {/* Step 1: Clips */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-bold flex items-center justify-center">
            1
          </span>
          <h2 className="text-white font-semibold text-sm">Drop your clips</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClipDropzone
            label="Clip A — start"
            state={clipA}
            onPicked={(f) => uploadClip(f, "a")}
            onClear={() => clear("a")}
            onError={setError}
          />
          <ClipDropzone
            label="Clip B — end (optional)"
            state={clipB}
            onPicked={(f) => uploadClip(f, "b")}
            onClear={() => clear("b")}
            onError={setError}
          />
        </div>
      </div>

      {/* Step 2: Preset gallery */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-bold flex items-center justify-center">
            2
          </span>
          <h2 className="text-white font-semibold text-sm">Pick a transition</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {PRESETS.map((p) => {
            const active = p.id === presetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPresetId(p.id)}
                className={`relative rounded-xl border p-3 text-left transition-all min-h-[88px] ${
                  active
                    ? "border-fuchsia-500/70 bg-gradient-to-br from-fuchsia-500/15 to-orange-500/10 ring-1 ring-fuchsia-500/40"
                    : "border-white/10 bg-[#1e1e32] hover:border-white/30"
                }`}
                aria-pressed={active}
              >
                {p.badge && (
                  <span
                    className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded-full ${
                      p.badge === "popular"
                        ? "bg-fuchsia-500/20 text-fuchsia-300"
                        : "bg-cyan-500/20 text-cyan-300"
                    }`}
                  >
                    {p.badge.toUpperCase()}
                  </span>
                )}
                <div className="text-2xl mb-1.5" aria-hidden="true">
                  {p.icon}
                </div>
                <p
                  className={`text-sm font-semibold leading-tight ${
                    active ? "text-white" : "text-white/85"
                  }`}
                >
                  {p.name}
                </p>
                <p className="text-[11px] text-white/45 leading-tight mt-0.5">
                  {p.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Optional override */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-white/10 text-white/60 text-xs font-bold flex items-center justify-center">
            3
          </span>
          <h2 className="text-white/80 font-semibold text-sm">
            Add direction <span className="text-white/40 font-normal">— optional</span>
          </h2>
        </div>
        <textarea
          rows={2}
          placeholder="e.g. ‘end on a slow dolly into the subject’s face’"
          className="w-full rounded-xl border border-white/15 bg-[#1e1e32] p-4 text-sm text-white placeholder:text-white/40 focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/30 outline-none resize-none"
          value={override}
          onChange={(e) => setOverride(e.target.value)}
        />
      </div>

      {/* Generate */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={loading || !clipA.uploadedUrl || !preset}
        data-testid="generate-button"
        className="w-full py-3 rounded-xl bg-brand-gradient text-white font-bold text-sm hover:opacity-90 transition-all glow-btn disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading
          ? "Working…"
          : preset
          ? `Generate · ${preset.name}${willStitch ? " (full stitch)" : ""}`
          : "Generate"}
      </button>

      {loading && (
        <div className="rounded-xl border border-white/10 bg-[#1e1e32] px-5 py-4">
          <div className="space-y-2">
            <ProgressRow
              label="Extract last frame of Clip A"
              state={
                clipA.kind === "video"
                  ? stepIndex(step, "extracting")
                  : "skip"
              }
              skipText="not a video"
            />
            <ProgressRow
              label={`Generate AI transition (${preset?.name ?? ""})`}
              state={stepIndex(step, "generating")}
            />
            <ProgressRow
              label="Stitch Clip A + AI middle + Clip B"
              state={willStitch ? stepIndex(step, "stitching") : "skip"}
              skipText="needs both clips as videos"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-[#FE2C55]/10 border border-[#FE2C55]/20 px-4 py-3">
          <p className="text-[#FE2C55] text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div data-testid="tool-result" className="space-y-3">
          <video
            controls
            src={result}
            className="w-full rounded-xl border border-white/15 bg-black"
          />
          <div className="flex flex-wrap items-center gap-3">
            <ShareButton mediaUrl={result} mediaType="video" caption={preset?.name} />
            <button
              type="button"
              onClick={() =>
                smartDownload(result, "video", planId, {
                  filename: `memacta-transition-${preset?.id ?? "video"}-${Date.now()}`,
                })
              }
              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              Download
            </button>
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                />
              </svg>
              Save to Library
            </Link>
          </div>
          <WatermarkHint planId={planId} mediaType="video" variant="block" />
        </div>
      )}
    </div>
  );
}
