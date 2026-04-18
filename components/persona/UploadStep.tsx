"use client";

import { useState, useRef } from "react";

export interface UploadedPhoto {
  id: string;
  url: string;
  storageKey: string;
  isPrimary: boolean;
  rejected: boolean;
  rejectReason?: string | null;
}

interface UploadStepProps {
  personaId: string;
  photos: UploadedPhoto[];
  onPhotoAdded: (photo: UploadedPhoto) => void;
  onPhotoRemoved: (photoId: string) => void;
}

const MAX_PHOTOS = 5;

export default function UploadStep({ personaId, photos, onPhotoAdded, onPhotoRemoved }: UploadStepProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedPhotos = photos.filter((p) => !p.rejected);
  const canUpload = acceptedPhotos.length < MAX_PHOTOS;

  async function handleFiles(files: FileList | null) {
    if (!files || !canUpload) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      if (acceptedPhotos.length >= MAX_PHOTOS) break;
      if (!file.type.startsWith("image/")) continue;

      try {
        // Upload to /api/upload to get a URL, then post to /api/persona/:id/photos
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          console.warn("Upload failed:", await uploadRes.text());
          continue;
        }

        const uploadData = await uploadRes.json() as { url: string; key?: string };
        const storageKey = uploadData.key ?? uploadData.url;

        // Post to persona photos endpoint
        const photoRes = await fetch(`/api/persona/${personaId}/photos`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: uploadData.url, storageKey }),
        });

        const photoData = await photoRes.json() as { photo?: UploadedPhoto; error?: string; reason?: string };

        if (photoData.photo) {
          onPhotoAdded(photoData.photo);
        }
      } catch (e) {
        console.error("Photo upload error:", e);
      }
    }

    setUploading(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-white font-semibold text-lg mb-1">Upload Photos</h2>
        <p className="text-white/50 text-sm">
          Upload 1-5 clear photos of the same face. Each photo must show exactly one adult face.
        </p>
      </div>

      {/* Drop zone */}
      {canUpload && (
        <div
          className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
            dragOver
              ? "border-pink-500/60 bg-pink-500/5"
              : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
              <p className="text-white/60 text-sm">Analyzing photos...</p>
            </div>
          ) : (
            <>
              <svg className="w-10 h-10 text-white/30 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-white/70 text-sm font-medium">Drop photos here or click to browse</p>
              <p className="text-white/40 text-xs mt-1">
                {acceptedPhotos.length}/{MAX_PHOTOS} photos uploaded
              </p>
            </>
          )}
        </div>
      )}

      {/* Photo thumbnails */}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 ${
                  photo.rejected ? "border-red-500/50" : "border-emerald-500/50"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
              </div>

              {/* Status indicator */}
              <div
                className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-[#111122] flex items-center justify-center ${
                  photo.rejected ? "bg-red-500" : "bg-emerald-500"
                }`}
              >
                {photo.rejected ? (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => onPhotoRemoved(photo.id)}
                className="absolute -bottom-1.5 -left-1.5 w-5 h-5 rounded-full bg-white/20 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Reject reason tooltip */}
              {photo.rejected && photo.rejectReason && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-red-900/90 text-red-200 text-[10px] whitespace-nowrap z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  {photo.rejectReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
