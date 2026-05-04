import Link from "next/link";

export const metadata = {
  title: "Terms of Service | memacta",
  description: "memacta Terms of Service — read before using the platform.",
};

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-white/40">Last updated: 2026-04-22</p>
      </div>

      <div className="space-y-10 text-white/70 leading-relaxed">

        {/* 1. Definitions */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">1. Definitions</h2>
          <dl className="space-y-2">
            <div><dt className="inline font-semibold text-white/90">"memacta"</dt>
              <dd className="inline"> — the memacta platform, website, APIs, and services operated by <span className="text-white/90 font-semibold">[USER TO FILL: legal entity name, e.g. "memacta Inc."]</span>.</dd></div>
            <div><dt className="inline font-semibold text-white/90">"User" / "you"</dt>
              <dd className="inline"> — any individual who creates an account or accesses the platform.</dd></div>
            <div><dt className="inline font-semibold text-white/90">"Persona"</dt>
              <dd className="inline"> — an AI character trained on a set of reference photographs you upload, producing a LoRA model file that can be referenced in subsequent Generations.</dd></div>
            <div><dt className="inline font-semibold text-white/90">"Generation"</dt>
              <dd className="inline"> — a single AI-produced image or video output produced via the memacta platform.</dd></div>
            <div><dt className="inline font-semibold text-white/90">"Content"</dt>
              <dd className="inline"> — any media (photos, videos, text prompts, or AI outputs) submitted to or produced on the platform.</dd></div>
          </dl>
        </section>

        {/* 2. Eligibility */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">2. Eligibility</h2>
          <p>You must be at least <strong className="text-white/90">18 years old</strong> and have a verified email address to create an account and access Persona features. By using memacta you represent and warrant that you meet this requirement. Accounts suspected of being operated by minors will be suspended pending age verification.</p>
        </section>

        {/* 3. Acceptable Use */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">3. Acceptable Use</h2>
          <p className="mb-3">You agree <em>not</em> to use memacta to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Generate, upload, or distribute child sexual abuse material (CSAM) or any sexualised depiction of a minor, real or synthetic.</li>
            <li>Create non-consensual intimate imagery (NCII) or deepfakes of any person without documented consent.</li>
            <li>Generate content that depicts celebrities, public figures, or politicians without their explicit, documented consent.</li>
            <li>Upload copyrighted training data (photos owned by a third party without a licence) to train a Persona.</li>
            <li>Use Generations for fraud, impersonation, defamation, harassment, or unlawful discrimination.</li>
            <li>Circumvent our safety filters, rate limits, or daily generation caps through automation, account farming, or prompt injection.</li>
            <li>Attempt to extract, reverse-engineer, or redistribute the underlying model weights, LoRA files, or face embeddings for Personas other than your own.</li>
          </ul>
          <p className="mt-3">Prompts are screened automatically before generation. Repeated policy violations result in suspension or permanent termination of your account.</p>
        </section>

        {/* 4. Persona Ownership and Data */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">4. Persona Ownership</h2>
          <p className="mb-2">You retain ownership of the original reference photographs you upload. You own your trained Persona LoRA file for use within memacta during an active subscription.</p>
          <p className="mb-2">By training a Persona you grant memacta a limited, non-exclusive, worldwide licence to store the photos, compute the face embedding, train the LoRA, and use the resulting model to generate images and videos on your behalf when you issue generation requests.</p>
          <p className="mb-2"><strong className="text-white/90">memacta does not use your Persona data to train foundational models, sell your likeness to third parties, or share your LoRA files with other users.</strong></p>
          <p>On account cancellation or deletion you may request export of your LoRA file within 30 days. After deletion, LoRA files, face embeddings, and reference photos are permanently deleted within 30 days. Your generation right on the platform ceases upon account termination.</p>
        </section>

        {/* 5. Subscription and Billing */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">5. Subscription and Billing</h2>
          <p className="mb-2">memacta offers tiered subscription plans (Free, Creator, Pro, Studio). Credits are used per Generation; cost varies by model and output type and is shown before you generate.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-white/90">Credit accrual:</strong> monthly credits reset at your billing date. Unused credits do not roll over unless you are on an annual plan, which carries a 60-day rollover buffer.</li>
            <li><strong className="text-white/90">Credit packs:</strong> purchased as a one-time add-on. Non-refundable once purchased.</li>
            <li><strong className="text-white/90">Subscription refunds:</strong> annual subscriptions may be refunded on a pro-rata basis within 14 days of the initial purchase or renewal. Monthly subscriptions are non-refundable.</li>
            <li><strong className="text-white/90">Price changes:</strong> we will notify you at least 14 days before any price increase. Continued use after the effective date constitutes acceptance.</li>
          </ul>
          <p className="mt-3">Billing is handled by Stripe. See Stripe's <a href="https://stripe.com/privacy" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">Privacy Policy</a> for how your payment data is processed.</p>
        </section>

        {/* 6. Intellectual Property in Generations */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">6. Intellectual Property in Generations</h2>
          <p className="mb-2">Subject to the underlying model providers' terms and applicable law, you own the creative rights in the Generations you produce. You grant memacta a non-exclusive, royalty-free licence to host, display, and process your Generations for the purpose of operating the service (e.g. your library, sharing features, and safety review).</p>
          <p>Free-tier Generations carry a visible memacta watermark. Creator and above tiers may download watermark-free images. All AI-generated content is marked with a C2PA provenance signal in accordance with the EU AI Act deepfake disclosure requirement and memacta's commitment to responsible AI.</p>
        </section>

        {/* 7. Termination */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">7. Termination</h2>
          <p className="mb-2">You may delete your account at any time via <Link href="/account" className="underline hover:text-white">Account Settings</Link>. Deletion initiates a 30-day grace period before permanent erasure of your data.</p>
          <p>memacta may suspend or terminate your account immediately for material violations of these Terms, including but not limited to CSAM, harassment, or fraud. We may also terminate accounts during a platform wind-down with 30 days' notice where feasible.</p>
        </section>

        {/* 8. Limitation of Liability */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">8. Limitation of Liability</h2>
          <p className="mb-2">The service is provided "as is" without warranty of any kind, express or implied. To the fullest extent permitted by applicable law, memacta and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, lost data, or business interruption, arising from your use of the platform.</p>
          <p>Our aggregate liability for any claim arising from your use of memacta will not exceed the greater of (a) the amount you paid to memacta in the 12 months preceding the claim, or (b) USD $50.</p>
        </section>

        {/* 9. Indemnification */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">9. Indemnification</h2>
          <p>You agree to indemnify and hold harmless memacta, its officers, directors, employees, and agents from any claims, damages, losses, and expenses (including reasonable legal fees) arising from your use of the platform, your Content, or your violation of these Terms.</p>
        </section>

        {/* 10. Governing Law */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">10. Governing Law</h2>
          {/* [USER TO FILL] — Confirm governing-law jurisdiction before launch */}
          <p>These Terms are governed by the laws of the State of <span className="text-white/90 font-semibold">[USER TO FILL: e.g. "Delaware, USA"]</span>, without regard to its conflict-of-law rules. Any dispute will be resolved by binding arbitration in <span className="text-white/90 font-semibold">[USER TO FILL: city/state]</span>, except that either party may seek injunctive relief in court for IP or confidentiality violations.</p>
        </section>

        {/* 11. Changes */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">11. Changes to These Terms</h2>
          <p>We may revise these Terms as the product evolves. Material changes will be announced by in-app notification and email to your registered address at least 7 days before taking effect. Continued use after the effective date means you accept the revised Terms.</p>
        </section>

        {/* 12. Contact */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">12. Contact</h2>
          {/* [USER TO FILL] — Replace with real legal/support contact once domain is verified */}
          <p>Legal questions can be sent to <a href="mailto:legal@memacta.ai" className="underline hover:text-white">legal@memacta.ai</a> or via the <Link href="/contact" className="underline hover:text-white">contact form</Link>. Mailing address: <span className="text-white/90 font-semibold">[USER TO FILL: company mailing address]</span>.</p>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm text-white/40">
        <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        <Link href="/legal/dmca" className="hover:text-white transition-colors">DMCA Policy</Link>
        <Link href="/legal/ai-likeness" className="hover:text-white transition-colors">AI Likeness Policy</Link>
        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
      </div>
    </main>
  );
}
