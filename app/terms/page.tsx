export const metadata = { title: "memacta - Terms of Service" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-brand-gradient">
        Terms of Service
      </h1>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Acceptance of Terms</h2>
          <p>
            By accessing or using memacta, you agree to be bound by these Terms of Service. If you
            do not agree to these terms, you may not access or use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Account Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activities that occur under your account. You must notify us immediately of any
            unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Acceptable Use</h2>
          <p>
            You agree not to use memacta to generate content that is illegal, harmful, threatening,
            abusive, harassing, defamatory, or otherwise objectionable. We reserve the right to
            suspend or terminate accounts that violate these guidelines.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Intellectual Property</h2>
          <p>
            Content you generate using memacta is yours to use, subject to the terms of the
            underlying AI model providers. The memacta platform, brand, and proprietary technology
            remain the property of memacta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Credits and Billing</h2>
          <p>
            Credits purchased on memacta are non-transferable and are used to access AI generation
            services. Pricing is subject to change with notice. Refunds are available within 7 days
            of purchase for unused credits.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Limitation of Liability</h2>
          <p>
            memacta is provided as-is without warranty. We shall not be liable for any indirect,
            incidental, special, or consequential damages arising from your use of the platform.
          </p>
        </section>
      </div>
    </main>
  );
}
