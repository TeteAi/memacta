"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UploadStep, { type UploadedPhoto } from "./UploadStep";
import NameStep from "./NameStep";
import InstantPreview from "./InstantPreview";

type WizardStep = "upload" | "name" | "ready";

interface PersonaData {
  id: string;
  name: string;
  triggerWord: string;
  status: string;
}

export default function PersonaWizard() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("upload");
  const [persona, setPersona] = useState<PersonaData | null>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [name, setName] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [previews, setPreviews] = useState<Array<{ url: string }>>([]);
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  const acceptedPhotos = photos.filter((p) => !p.rejected);

  // Step 1 → Step 2: create draft persona when user moves to name step
  async function handleGoToName() {
    if (acceptedPhotos.length === 0) {
      setError("Upload at least one photo first.");
      return;
    }
    setError(null);

    // Create draft persona with a temporary name
    try {
      const res = await fetch("/api/persona", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "My Persona" }),
      });
      const data = await res.json() as PersonaData & { error?: string; reason?: string };
      if (!res.ok) {
        if (data.reason === "email_unverified") {
          setError("Please verify your email before creating a persona.");
        } else {
          setError(data.error ?? "Failed to create persona");
        }
        return;
      }
      setPersona(data);

      // Upload photos to the persona
      for (const photo of acceptedPhotos) {
        await fetch(`/api/persona/${data.id}/photos`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: photo.url, storageKey: photo.storageKey }),
        });
      }

      setStep("name");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  // Step 2 → Step 3: finalize persona and generate previews
  async function handleFinalize() {
    if (!persona) return;
    if (!name.trim()) {
      setError("Please enter a name for your persona.");
      return;
    }
    if (!consentAgreed) {
      setError("Please accept the consent statement.");
      return;
    }
    setError(null);
    setFinalizing(true);

    try {
      // Update persona name (if changed)
      // For v1, we create with a temp name then rename — or just proceed with the name
      // Actually we need to persist consent first
      const consentRes = await fetch(`/api/persona/${persona.id}/consent`, {
        method: "POST",
      });
      if (!consentRes.ok) {
        const d = await consentRes.json() as { error?: string };
        setError(d.error ?? "Consent failed");
        setFinalizing(false);
        return;
      }

      // Finalize instant
      const finalRes = await fetch(`/api/persona/${persona.id}/finalize-instant`, {
        method: "POST",
      });
      if (!finalRes.ok) {
        const d = await finalRes.json() as { error?: string; reason?: string };
        setError(d.reason ?? d.error ?? "Finalization failed");
        setFinalizing(false);
        return;
      }

      setStep("ready");

      // Generate previews in background
      setLoadingPreviews(true);
      const previewRes = await fetch(`/api/persona/${persona.id}/preview`, {
        method: "POST",
      });
      if (previewRes.ok) {
        const previewData = await previewRes.json() as { previews: Array<{ url: string }> };
        setPreviews(previewData.previews ?? []);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setFinalizing(false);
      setLoadingPreviews(false);
    }
  }

  const STEP_LABELS = ["Upload", "Name & Consent", "Ready"];
  const STEP_INDEX = { upload: 0, name: 1, ready: 2 };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => {
          const currentIdx = STEP_INDEX[step];
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={label} className="flex items-center gap-2 flex-1 min-w-0">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                done ? "bg-gradient-to-r from-pink-500 to-orange-500 border-transparent text-white" :
                active ? "border-pink-500 text-pink-400" :
                "border-white/20 text-white/30"
              }`}>
                {done ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : i + 1}
              </div>
              <span className={`text-xs font-medium truncate ${active ? "text-white" : done ? "text-white/60" : "text-white/30"}`}>
                {label}
              </span>
              {i < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-px ${done ? "bg-gradient-to-r from-pink-500 to-orange-500" : "bg-white/10"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="rounded-2xl bg-[#181828] border border-white/10 p-6">
        {step === "upload" && (
          <UploadStep
            personaId="preview"
            photos={photos}
            onPhotoAdded={(photo) => setPhotos((prev) => [...prev, photo])}
            onPhotoRemoved={(photoId) => setPhotos((prev) => prev.filter((p) => p.id !== photoId))}
          />
        )}

        {step === "name" && persona && (
          <NameStep
            name={name}
            onNameChange={setName}
            triggerWord={persona.triggerWord}
            consentAgreed={consentAgreed}
            onConsentChange={setConsentAgreed}
          />
        )}

        {step === "ready" && persona && (
          <InstantPreview
            personaId={persona.id}
            personaName={name || "Your Persona"}
            previews={previews}
            loading={loadingPreviews}
          />
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-[#FE2C55]/10 border border-[#FE2C55]/20 px-4 py-3">
            <p className="text-[#FE2C55] text-sm">{error}</p>
          </div>
        )}

        {/* Navigation */}
        {step === "upload" && (
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoToName}
              disabled={acceptedPhotos.length === 0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {step === "name" && (
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep("upload")}
              className="flex-1 py-3 rounded-xl border border-white/20 text-white text-sm hover:bg-white/10 transition-all"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleFinalize}
              disabled={!name.trim() || !consentAgreed || finalizing}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {finalizing ? "Creating..." : "Finish — Generate 4 Previews"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
