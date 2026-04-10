export const metadata = { title: "memacta - Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 bg-brand-gradient bg-clip-text text-transparent">
        Privacy Policy
      </h1>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as your name, email address,
            and payment information when you create an account or make a purchase. We also collect
            usage data including generation history, model preferences, and platform interactions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services,
            process transactions, send communications, and ensure the security of your account.
            We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as needed
            to provide you services. You can request deletion of your account and associated data
            at any time by contacting our support team.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal information. You may
            also request a copy of your data or restrict its processing. To exercise these rights,
            please contact us through our contact page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Contact</h2>
          <p>
            For privacy-related inquiries, please reach out to us at privacy@memacta.app or
            through our contact page.
          </p>
        </section>
      </div>
    </main>
  );
}
