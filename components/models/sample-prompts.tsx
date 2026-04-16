"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  modelId: string;
  mediaType: "video" | "image";
  prompts: string[];
};

export default function SamplePrompts({ modelId, mediaType, prompts }: Props) {
  const createBase = mediaType === "image" ? "/create/image" : "/create/video";
  const [copied, setCopied] = useState<number | null>(null);

  function copyPrompt(text: string, idx: number) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-4">Sample Prompts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map((prompt, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between gap-4 rounded-xl border border-white/15 bg-[#181828] p-4"
          >
            <p className="text-sm text-white/80 leading-relaxed flex-1">&ldquo;{prompt}&rdquo;</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyPrompt(prompt, idx)}
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
              >
                {copied === idx ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <Link
                href={`${createBase}?model=${modelId}&prompt=${encodeURIComponent(prompt)}`}
                className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
              >
                Try this prompt
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
