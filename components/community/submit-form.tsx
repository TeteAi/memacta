"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const TOOLS = [
  "Kling 3.0",
  "Sora 2",
  "Veo 3.1",
  "Soul 2.0",
  "Flux Kontext",
  "Other",
];

export default function SubmitForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [toolUsed, setToolUsed] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !mediaUrl.trim()) {
      setError("Title and media URL are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, mediaUrl, mediaType, toolUsed }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSuccess(true);
      setTimeout(() => router.push("/community"), 1500);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-semibold text-brand-cyan">
          Submitted successfully!
        </p>
        <p className="text-muted-foreground mt-2">Redirecting to community...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
          placeholder="Give your creation a name"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
          placeholder="Tell us about your creation"
        />
      </div>

      <div>
        <label htmlFor="mediaUrl" className="block text-sm font-medium mb-1">
          Media URL
        </label>
        <input
          id="mediaUrl"
          type="url"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
          placeholder="https://example.com/image.png"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="mediaType" className="block text-sm font-medium mb-1">
            Media Type
          </label>
          <select
            id="mediaType"
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as "image" | "video")}
            className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="toolUsed" className="block text-sm font-medium mb-1">
            Tool Used
          </label>
          <select
            id="toolUsed"
            value={toolUsed}
            onChange={(e) => setToolUsed(e.target.value)}
            className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
          >
            <option value="">Select tool</option>
            {TOOLS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Submitting..." : "Submit to Community"}
      </Button>
    </form>
  );
}
