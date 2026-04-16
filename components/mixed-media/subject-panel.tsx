"use client";

import { useRef } from "react";

interface SubjectPanelProps {
  subjectPrompt: string;
  onSubjectChange: (v: string) => void;
  referenceUrl: string | null;
  onReferenceUploaded: (url: string) => void;
  onReferenceClear: () => void;
}

export default function SubjectPanel({
  subjectPrompt,
  onSubjectChange,
  referenceUrl,
  onReferenceUploaded,
  onReferenceClear,
}: SubjectPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) onReferenceUploaded(data.url as string);
    } catch {
      // silent — reference image is optional
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div data-testid="subject-panel" className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">
          Subject prompt <span className="text-white/40">(required)</span>
        </label>
        <textarea
          data-testid="subject-prompt"
          value={subjectPrompt}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="A warrior on horseback charging through mist..."
          rows={3}
          className="w-full rounded-xl bg-[#1e1e32] border border-white/15 text-white placeholder-white/30 px-4 py-3 text-sm resize-none focus:outline-none focus:border-fuchsia-400/60 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">
          Reference image <span className="text-white/40">(optional)</span>
        </label>
        {referenceUrl ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={referenceUrl} alt="Reference" className="w-16 h-16 rounded-lg object-cover border border-white/15" />
            <button
              type="button"
              onClick={onReferenceClear}
              className="text-xs text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/15 hover:border-white/30"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors p-4 text-sm text-white/50 hover:text-white/70"
          >
            Drop image or click to upload
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
