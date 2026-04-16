import type { MetadataRoute } from "next";
import { videoModels, imageModels } from "@/lib/ai/models";

// Static sitemap for the top-level public routes. Anything behind auth
// (/account, /library, /studio, /admin/*) is deliberately excluded —
// search engines can't index it, and we don't want to list it here in
// case we accidentally leak internal route shapes.

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.APP_URL ??
    process.env.AUTH_URL ??
    "https://memacta.vercel.app";

  const now = new Date();

  const staticRoutes: string[] = [
    "",
    "/about",
    "/pricing",
    "/community",
    "/community/contests",
    "/blog",
    "/careers",
    "/contact",
    "/effects",
    "/tools",
    "/models",
    "/trust",
    "/privacy",
    "/terms",
    "/cookies",
    "/prompt-guide",
    "/create",
    "/create/image",
    "/create/video",
    "/create/image-to-video",
  ];

  const modelRoutes = [...videoModels(), ...imageModels()].map(
    (m) => `/models/${m.id}`
  );

  const all = [...staticRoutes, ...modelRoutes];

  return all.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1.0 : 0.7,
  }));
}
