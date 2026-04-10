export const metadata = { title: "memacta - Trust & Safety" };

export default function TrustPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 bg-brand-gradient bg-clip-text text-transparent">
        Trust &amp; Safety
      </h1>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Content Moderation</h2>
          <p>
            memacta employs a multi-layered content moderation system to ensure all generated content
            meets our community standards. Every generation is automatically screened using AI-powered
            classifiers before being made available to users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">NSFW Filters</h2>
          <p>
            Our platform includes built-in NSFW filters that are enabled by default for all users.
            These filters prevent the generation and distribution of explicit, violent, or otherwise
            inappropriate content across all AI models available on the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Reporting</h2>
          <p>
            If you encounter content that violates our guidelines, you can report it directly from
            the community gallery. Our trust and safety team reviews all reports within 24 hours and
            takes appropriate action, including content removal and account suspension when necessary.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Data Protection</h2>
          <p>
            We take the security of your data seriously. All data is encrypted in transit and at rest.
            Generated content is stored securely and is only accessible to the account that created it,
            unless explicitly shared to the community gallery.
          </p>
        </section>
      </div>
    </main>
  );
}
