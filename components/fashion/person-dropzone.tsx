"use client";

import { useRef, useState } from "react";
import { handleAuthRequired } from "@/lib/auth-redirect";

interface PersonDropzoneProps {
  previewUrl: string | null;
  uploadedUrl: string | null;
  uploading: boolean;
  onUploaded: (url: string, preview: string) => void;
  onClear: () => void;
  onError: (msg: string) => void;
}

export default function PersonDropzone({
  previewUrl,
  uploadedUrl,
  uploading,
  onUploaded,
  onClear,
  onError,
}: PersonDropzoneProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  async function handleFile(file: File) {
    const preview = URL.createObjectURL(file);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (handleAuthRequired(res, json)) return;
      if (!res.ok) {
        onError(json.error || "Upload failed");
        return;
      }
      onUploaded(json.url, preview);
    } catch (e) {
      onError((e as Error).message);
    }
  }

  function handleUrlSubmit() {
    if (!urlInput.trim()) return;
    onUploaded(urlInput.trim(), urlInput.trim());
    setUrlInput("");
    setShowUrlInput(false);
  }

  return (
    <div data-testid="person-dropzone" className="space-y-2">
      <label className="text-white/60 text-xs font-medium block">
        Person Photo (1 slot — PNG/JPG up to 10 MB, or paste URL)
      </label>

      {previewUrl ? (
        <div className="rounded-xl border border-white/15 bg-[#181828] p-3 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Person reference"
            className="w-20 h-20 rounded-lg object-cover border border-white/15"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {uploading ? "Uploading…" : uploadedUrl ? "Ready" : "Person loaded"}
            </p>
            {uploading && (
              <div className="mt-1 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-fuchsia-500 animate-pulse w-1/2" />
              </div>
            )}
            <button
              type="button"
              onClick={onClear}
              className="mt-1 text-xs text-[#FE2C55] hover:text-red-300 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            className="rounded-xl border-2 border-dashed border-white/15 hover:border-fuchsia-500/40 bg-[#1e1e32] cursor-pointer transition-colors"
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <div className="py-8 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-white/10 flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-sm text-white/40">Click or drag &amp; drop to upload</p>
              <p className="text-xs text-white/25 mt-1">PNG, JPG up to 10 MB</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs text-white/50 hover:text-white/80 transition-colors underline"
            >
              {showUrlInput ? "Cancel" : "Or paste image URL"}
            </button>
          </div>

          {showUrlInput && (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleUrlSubmit(); }}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 rounded-xl border border-white/15 bg-[#1e1e32] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/30 outline-none"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-4 py-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-300 text-sm font-medium hover:bg-fuchsia-500/30 transition-colors border border-fuchsia-500/30"
              >
                Use
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
