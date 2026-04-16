export const metadata = { title: "memacta - Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold mb-2 text-brand-gradient">
        Privacy Policy
      </h1>
      <p className="text-sm text-white/40 mb-8">Last updated: April 16, 2026</p>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">What We Collect</h2>
          <p className="mb-3">
            When you use memacta, we collect:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Account information</strong> — your name, email, and profile image from
              Google when you sign in with OAuth.
            </li>
            <li>
              <strong>Generation data</strong> — the prompts you submit, the models you use, any
              reference images you upload, and the generated outputs themselves.
            </li>
            <li>
              <strong>Usage data</strong> — timestamps of generations, credit balance,
              success/failure logs, and moderation events (so we can improve the service and stop
              abuse).
            </li>
            <li>
              <strong>Anonymous session cookies</strong> — a local counter so users who haven&apos;t
              signed up yet can try a limited number of generations before creating an account.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Third-Party Processors</h2>
          <p className="mb-3">
            memacta is a thin layer over several third-party services. Your data passes through
            these processors under their own privacy terms:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>fal.ai</strong> — receives your prompts, uploaded images, and model
              parameters to run the generation. See their <a href="https://fal.ai/privacy" className="underline" target="_blank" rel="noopener noreferrer">privacy policy</a>.
            </li>
            <li>
              <strong>Google</strong> — provides OAuth sign-in. We receive your email, name, and
              profile image; Google receives that you signed in to memacta.
            </li>
            <li>
              <strong>Supabase</strong> — hosts the Postgres database storing your account,
              library, and credit ledger.
            </li>
            <li>
              <strong>Vercel</strong> — hosts the web app and collects server logs (IP address,
              request path, status codes) for up to 30 days.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">How We Use Your Information</h2>
          <p>
            We use the information we collect to (i) run the service — process generations, track
            credit balance, display your library — (ii) enforce safety — moderate prompts, detect
            abuse of rate limits, investigate terms violations — and (iii) improve memacta by
            analysing aggregate usage patterns. We do not sell your personal information, and we
            do not use your prompts or outputs to train our own models.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Data Retention</h2>
          <p>
            Account data, generation history, and credit ledger entries are retained while your
            account is active. Moderation events (when a prompt gets rejected) are retained for
            90 days for abuse-pattern analysis. Server logs are retained for up to 30 days.
            Deleting your account removes your account data within 30 days; anonymised aggregate
            metrics may persist.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Your Rights</h2>
          <p>
            You have the right to access, correct, export, or delete your personal information.
            You can also request we restrict processing or object to specific uses. To exercise
            these rights, email <a href="mailto:privacy@memacta.app" className="underline">privacy@memacta.app</a>{" "}
            — we respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Children&apos;s Privacy</h2>
          <p>
            memacta is not intended for users under 16. We do not knowingly collect information
            from children under that age. If you believe a child has provided us with information,
            email <a href="mailto:privacy@memacta.app" className="underline">privacy@memacta.app</a>{" "}
            and we will delete it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Contact</h2>
          <p>
            For privacy-related inquiries, reach out to <a href="mailto:privacy@memacta.app" className="underline">privacy@memacta.app</a>{" "}
            or through the contact page.
          </p>
        </section>
      </div>
    </main>
  );
}
