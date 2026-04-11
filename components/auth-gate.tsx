"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

interface AuthGateProps {
  children: React.ReactNode;
  action?: "download" | "share" | "save";
}

const ACTION_LABELS: Record<string, { title: string; description: string }> = {
  download: {
    title: "Sign up to download",
    description: "Create a free account to download your creations and access 30 free credits every day.",
  },
  share: {
    title: "Sign up to share",
    description: "Join memacta to share your creations with the community and follow other creators.",
  },
  save: {
    title: "Sign up to save",
    description: "Create a free account to save your work to your personal library.",
  },
};

export default function AuthGate({ children, action = "download" }: AuthGateProps) {
  const { data: session, status } = useSession();
  const [modalOpen, setModalOpen] = useState(false);

  if (status === "loading") return null;

  if (session?.user) {
    return <>{children}</>;
  }

  const info = ACTION_LABELS[action] ?? ACTION_LABELS.download;

  return (
    <>
      <div onClick={() => setModalOpen(true)} className="cursor-pointer">
        {children}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#181828] border border-white/15 p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center mb-6 mx-auto">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-2">{info.title}</h2>
            <p className="text-white/60 text-center text-sm mb-8 leading-relaxed">{info.description}</p>

            {/* Perks */}
            <ul className="space-y-2 mb-8">
              {[
                "30 free credits every day",
                "Access all AI models",
                "Community showcase",
                "Save to your library",
              ].map((perk) => (
                <li key={perk} className="flex items-center gap-2.5 text-sm text-white/70">
                  <svg className="w-4 h-4 text-fuchsia-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {perk}
                </li>
              ))}
            </ul>

            <button
              onClick={() => signIn()}
              className="w-full py-3 rounded-xl bg-brand-gradient text-white font-semibold glow-btn transition-all hover:opacity-90"
            >
              Create Free Account
            </button>

            <p className="mt-4 text-center text-xs text-white/40">
              Already have an account?{" "}
              <button onClick={() => signIn()} className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                Sign in
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
