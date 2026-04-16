import type { MetadataRoute } from "next";

// robots.txt. Disallow anything that's private (authed pages, internal
// APIs, the admin triage view) and point crawlers at the sitemap for
// the rest. We don't want Google indexing a user's /library or /account
// if they forget to add noindex on an individual route.

export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.APP_URL ??
    process.env.AUTH_URL ??
    "https://memacta.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/account",
          "/library",
          "/library/",
          "/studio",
          "/studio/",
          "/dashboard",
          "/auth/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
