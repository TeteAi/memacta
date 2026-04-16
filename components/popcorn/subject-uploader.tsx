"use client";

import { useRef } from "react";
import { handleAuthRequired } from "@/lib/auth-redirect";

interface SubjectUploaderProps {
  previewUrl: string | null;
  uploadedUrl: string | null;
  uploading: boolean;
  onUploaded: (url: string, previewDataUrl: string) => void;
  onClear: () => void;
  onError: (msg: string) => void;
}

export default function SubjectUploader({
  previewUrl,
  uploadedUrl,
  uploading,
  onUploaded,
  onClear,
  onError,
}: SubjectUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);

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

  return (
    <div data-testid="subject-uploader" className="space-y-2">
      <label className="text-white/60 text-xs font-medium block">
        Subject Image (optional — PNG/JPG up to 10 MB)
      </label>

      {previewUrl ? (
        <div className="rounded-xl border border-white/15 bg-[#181828] p-3 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Subject reference"
            className="w-16 h-16 rounded-lg object-cover border border-white/15"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {uploading ? "Uploading…" : uploadedUrl ? "Ready" : "Subject loaded"}
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
          <div className="py-6 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-white/10 flex items-center justify-center mb-2">
              <svg
                className="w-5 h-5 text-white/40"
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
            <p className="text-sm text-white/40">Click or drag &amp; drop to upload</p>
            <p className="text-xs text-white/25 mt-1">PNG, JPG up to 10 MB</p>
          </div>
        </div>
      )}
    </div>
  );
}
