"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Props = {
  /** When true the modal is rendered. Parent should only render this when
   *  the server confirms onboardedAt === null for the current user. */
  show: boolean;
};

const STEPS = [
  {
    step: 1,
    title: "Welcome to memacta",
    subtitle: "Let's create your first AI character",
    body: "memacta lets you build a personalised AI Persona from a handful of photos, then generate stunning images and videos featuring that character — consistently, in any scene, at any time.",
    cta: "Get started",
    ctaHref: null as string | null,
  },
  {
    step: 2,
    title: "What is a Persona?",
    subtitle: "Your identity, powered by AI",
    body: "A Persona is a LoRA model trained on your face (or any consented face). Once trained, you can drop it into any generation prompt to get consistent, on-brand results — from portraits to cinematic videos.",
    cta: "Create my first Persona",
    ctaHref: "/personas/new",
  },
  {
    step: 3,
    title: "You're all set",
    subtitle: "Generate, recast, and share",
    body: "Once your Persona is ready, head to Create to generate images and videos. Explore 18+ AI models, apply effects, or share directly to Instagram and TikTok.",
    cta: "Take me to Create",
    ctaHref: "/create",
  },
] as const;

export default function WelcomeModal({ show }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const dismiss = useCallback(async (href?: string) => {
    // Fire-and-forget — don't block the UX on the API call
    fetch("/api/onboarding/dismiss", { method: "POST" }).catch(() => {});
    setDismissed(true);
    if (href) {
      router.push(href);
    }
  }, [router]);

  if (!show || dismissed) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  function handleCta() {
    if (step.ctaHref) {
      dismiss(step.ctaHref);
    } else if (isLast) {
      dismiss();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  return (
    /* Full-screen backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to memacta"
    >
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/3 w-[480px] h-[480px] bg-fuchsia-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[320px] h-[320px] bg-orange-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-[#0e0e1a]/95 border border-white/15 shadow-2xl overflow-hidden">

        {/* Gradient accent bar at top */}
        <div className="h-1 w-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-500" />

        <div className="p-8 sm:p-10">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div
                key={s.step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 flex-1"
                    : i < currentStep
                    ? "bg-white/40 w-8"
                    : "bg-white/15 w-8"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-fuchsia-400 uppercase tracking-widest mb-2">
              Step {step.step} of {STEPS.length}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
              {step.title}
            </h2>
            <p className="text-sm font-medium text-white/60 mb-5">{step.subtitle}</p>
            <p className="text-white/70 leading-relaxed">{step.body}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleCta}
              className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 transition-all min-h-[44px]"
            >
              {step.cta}
            </button>

            {currentStep > 0 && !isLast && (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 text-white/70 font-medium text-sm hover:bg-white/20 transition-all min-h-[44px]"
              >
                Back
              </button>
            )}
          </div>

          {/* Skip */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => dismiss()}
              className="text-xs text-white/35 hover:text-white/60 transition-colors underline underline-offset-2"
            >
              Skip tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
