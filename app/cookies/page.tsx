export const metadata = { title: "memacta - Cookie Notice" };

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 bg-brand-gradient bg-clip-text text-transparent">
        Cookie Notice
      </h1>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help
            us provide a better experience by remembering your preferences and login state.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Essential Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. These cookies are
            required for the platform to function and cannot be disabled.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Analytics Cookies</h2>
          <p>
            We may use analytics cookies to understand how users interact with our platform. This
            data helps us improve our services and user experience. You can opt out of analytics
            cookies through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Managing Cookies</h2>
          <p>
            You can control and manage cookies through your browser settings. Please note that
            removing or blocking certain cookies may impact your experience on memacta.
          </p>
        </section>
      </div>
    </main>
  );
}
