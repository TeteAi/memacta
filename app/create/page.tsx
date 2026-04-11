"use client";

import { useState } from "react";
import Link from "next/link";
import GenerateForm from "@/components/create/generate-form";

export default function CreatePage() {
  const [tab, setTab] = useState<"video" | "image">("video");
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-brand-gradient bg-clip-text text-transparent">Create</h1>
        <p className="text-white/70 mt-2">Transform your ideas into stunning visuals with AI</p>
      </div>

      <div className="flex gap-2 mb-8">
        <button
          type="button"
          onClick={() => setTab("video")}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            tab === "video"
              ? "bg-brand-gradient text-white shadow-lg shadow-purple-500/20"
              : "bg-white/15 text-white/70 hover:bg-white/25 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Video
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("image")}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            tab === "image"
              ? "bg-brand-gradient text-white shadow-lg shadow-purple-500/20"
              : "bg-white/15 text-white/70 hover:bg-white/25 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            Image
          </span>
        </button>
      </div>

      <div className="rounded-2xl bg-[#181828] border border-white/15 p-6">
        <GenerateForm key={tab} mediaType={tab} />
      </div>

      <div className="mt-8 flex items-center gap-4">
        <Link href="/tools" className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
          </svg>
          Explore more tools
        </Link>
        <Link href="/effects" className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          Browse effects
        </Link>
      </div>
    </main>
  );
}
