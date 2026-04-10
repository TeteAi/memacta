"use client";

import { useState } from "react";
import Link from "next/link";
import GenerateForm from "@/components/create/generate-form";

export default function CreatePage() {
  const [tab, setTab] = useState<"video" | "image">("video");
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold mb-4">Create</h1>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTab("video")}
          className={`rounded-full border px-4 py-1 text-sm ${
            tab === "video" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          }`}
        >
          Video
        </button>
        <button
          type="button"
          onClick={() => setTab("image")}
          className={`rounded-full border px-4 py-1 text-sm ${
            tab === "image" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          }`}
        >
          Image
        </button>
      </div>
      <GenerateForm key={tab} mediaType={tab} />
      <div className="mt-8">
        <Link href="/tools" className="text-white/70 hover:text-white underline">
          Explore more tools →
        </Link>
      </div>
    </main>
  );
}
