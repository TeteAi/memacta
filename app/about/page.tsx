export const metadata = { title: "memacta - About" };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-brand-gradient">
        About memacta
      </h1>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Our Mission</h2>
          <p>
            memacta exists to democratize creative expression through AI. We believe everyone
            should have access to powerful creative tools, regardless of technical skill or
            budget. Our platform brings together the best AI models for image and video generation,
            editing, and enhancement into one unified experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Built with AI</h2>
          <p>
            From concept to creation, memacta leverages cutting-edge AI models including Kling,
            Sora, Veo, WAN, Flux, and many more. Our platform integrates over 20 AI models to give
            creators unprecedented flexibility and quality in their workflows.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Our Team</h2>
          <p>
            memacta is built by a passionate team of AI researchers, engineers, and designers
            who are committed to pushing the boundaries of creative AI. We are headquartered
            in San Francisco with team members across the globe.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Join the Community</h2>
          <p>
            Thousands of creators use memacta every day to bring their ideas to life. Join our
            community to share your creations, discover inspiration, and connect with fellow
            creators.
          </p>
        </section>
      </div>
    </main>
  );
}
