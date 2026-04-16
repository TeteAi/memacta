export const metadata = { title: "memacta - Terms of Service" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold mb-2 text-brand-gradient">
        Terms of Service
      </h1>
      <p className="text-sm text-white/40 mb-8">Last updated: April 16, 2026</p>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Beta Service</h2>
          <p>
            memacta is currently in private beta. The service is provided as a work-in-progress and
            may be unavailable, change materially, or lose data without notice. Do not rely on
            memacta for anything mission-critical, and always keep your own copies of generations
            you want to keep.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Acceptance of Terms</h2>
          <p>
            By accessing or using memacta, you agree to be bound by these Terms of Service. If you
            do not agree to these terms, you may not access or use the platform. You must be at
            least 16 years old to use memacta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Account Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activities that occur under your account. Notify us immediately of any
            unauthorized use. You may not share your account, create multiple accounts to farm free
            credits, or attempt to circumvent the rate limits or daily generation cap.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Acceptable Use</h2>
          <p className="mb-3">
            You agree not to use memacta to generate, upload, or share content that:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Depicts, sexualises, or endangers minors, including CSAM of any form.</li>
            <li>
              Is a non-consensual deepfake or sexual depiction of a real person without their clear
              consent.
            </li>
            <li>Depicts graphic violence, self-harm, or content glorifying either.</li>
            <li>
              Infringes on anyone&apos;s copyright, trademark, publicity rights, or other
              intellectual property.
            </li>
            <li>Contains illegal content under the laws of your jurisdiction.</li>
            <li>
              Is used to harass, defame, threaten, impersonate, or defraud another person.
            </li>
          </ul>
          <p className="mt-3">
            Prompts are screened automatically before generation, and accounts repeatedly
            triggering moderation blocks will be suspended. We may remove generations and terminate
            accounts that violate these rules, with or without notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">AI-Generated Content</h2>
          <p>
            Generations are produced by third-party AI models (Kling, Sora, Veo, Flux, and others)
            via the fal.ai platform. Outputs are probabilistic — they may not match your prompt,
            may contain artifacts or errors, and may resemble other works by coincidence.
            Downloaded images carry a &ldquo;memacta&rdquo; watermark. You are responsible for
            reviewing outputs before sharing, publishing, or using them commercially, and for
            complying with each underlying model&apos;s own terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Content Ownership</h2>
          <p>
            Subject to the underlying model providers&apos; terms and applicable law, generations
            you create are yours to use. You grant memacta a non-exclusive, worldwide licence to
            host, process, and display your generations for the purpose of running the service
            (e.g. the library, sharing features, and anti-abuse review). The memacta platform,
            brand, and proprietary code remain the property of memacta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Credits and Billing</h2>
          <p>
            Paid credit purchases are not yet available during the beta — every user receives a
            daily allotment of free credits instead. When paid credits launch, they will be
            non-transferable, will not expire, and will be used to access AI generation services.
            Pricing is subject to change with advance notice to existing customers. Refunds will be
            available within 7 days of purchase for unused credits.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Copyright &amp; DMCA</h2>
          <p>
            If you believe content on memacta infringes your copyright, send a notice including
            (i) your contact details, (ii) identification of the copyrighted work, (iii) the URL of
            the infringing content, and (iv) a statement that you have a good-faith belief the use
            is not authorised, to <a href="mailto:dmca@memacta.app" className="underline">dmca@memacta.app</a>.
            We respond to valid notices by removing the content and may terminate repeat
            infringers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Limitation of Liability</h2>
          <p>
            memacta is provided as-is, without warranty of any kind. To the maximum extent
            permitted by law, memacta shall not be liable for any indirect, incidental, special, or
            consequential damages, lost profits, or lost data arising from your use of the
            platform. Our aggregate liability for any claim will not exceed the amount you paid us
            in the 12 months preceding the claim (or $50 if you paid nothing).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Changes</h2>
          <p>
            We may update these terms as the product evolves. Material changes will be announced
            by email or in-app. Continued use after changes take effect means you accept the
            updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Contact</h2>
          <p>
            Questions? Reach us at <a href="mailto:hello@memacta.app" className="underline">hello@memacta.app</a>{" "}
            or through the contact page.
          </p>
        </section>
      </div>
    </main>
  );
}
