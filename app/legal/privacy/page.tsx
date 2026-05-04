import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | memacta",
  description: "How memacta collects, uses, and protects your data — including biometric and AI-generated content.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-white/40">Last updated: 2026-04-22</p>
      </div>

      <div className="space-y-10 text-white/70 leading-relaxed">

        {/* 1. What We Collect */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">1. What We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-white/90">Account data:</strong> email address, display name, password hash (bcrypt), profile image URL.</li>
            <li><strong className="text-white/90">Uploaded photos (Persona training):</strong> reference photographs you provide to train a Persona LoRA model.</li>
            <li><strong className="text-white/90">Face embeddings (biometric data — see §2):</strong> a numerical vector derived from your face geometry, used for identity consistency across Generations.</li>
            <li><strong className="text-white/90">Generated content:</strong> prompts, model selections, output images and videos, and associated metadata.</li>
            <li><strong className="text-white/90">Billing data:</strong> subscription tier, credit balance, transaction history. Payment instrument details are held exclusively by Stripe — we never see raw card numbers.</li>
            <li><strong className="text-white/90">Technical data:</strong> IP address, browser user agent, request logs, error traces (Sentry), and Upstash rate-limit counters.</li>
            <li><strong className="text-white/90">Cookies and session tokens:</strong> NextAuth.js session cookies for authentication; an anonymous generation counter stored in a first-party cookie for unauthenticated trial use.</li>
          </ul>
        </section>

        {/* 2. Biometric Data Notice */}
        <section className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-6">
          <h2 className="text-xl font-bold text-white mb-3">2. Biometric Data Notice (BIPA / Texas CUBI / GDPR Art. 9)</h2>
          <p className="mb-3">
            When you train a Persona, memacta derives a <strong className="text-white/90">face embedding</strong> — a mathematical representation of the geometry of the face in your reference photos. This constitutes biometric data under the Illinois Biometric Information Privacy Act (BIPA), the Texas Capture or Use of Biometric Identifiers Act (CUBI), and qualifies as special-category data under GDPR Article 9.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-white/90">Consent:</strong> By proceeding past the Persona consent checkpoint, you explicitly consent to memacta computing and storing your face embedding. You may withdraw consent at any time by deleting the Persona.</li>
            <li><strong className="text-white/90">Purpose limitation:</strong> Face embeddings are used solely for identity consistency within your Generations. They are never shared with third parties or used for any purpose other than running the Persona feature for your account.</li>
            <li><strong className="text-white/90">Retention:</strong> Face embeddings are retained for the lifetime of the Persona and for a maximum of <strong>12 months</strong> after the Persona's last generation use. You may request deletion at any time by archiving or deleting the Persona.</li>
            <li><strong className="text-white/90">Right to delete:</strong> Delete any Persona via its settings page, or submit a deletion request to <a href="mailto:privacy@memacta.ai" className="underline hover:text-white">privacy@memacta.ai</a>. We will confirm and complete deletion within 30 days.</li>
            <li><strong className="text-white/90">No sale:</strong> We will never sell, lease, trade, or profit from your biometric data.</li>
          </ul>
        </section>

        {/* 3. Why We Collect */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">3. Why We Collect Your Data</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-white/90">Providing the service:</strong> account authentication, credit tracking, Persona training, image/video generation.</li>
            <li><strong className="text-white/90">Safety and abuse prevention:</strong> prompt moderation, rate limiting, detection of policy violations, CSAM hash scanning.</li>
            <li><strong className="text-white/90">Billing:</strong> managing subscriptions and credit packs via Stripe.</li>
            <li><strong className="text-white/90">Communications:</strong> transactional emails (email verification, password reset, training-complete notifications) via Resend.</li>
            <li><strong className="text-white/90">Service improvement:</strong> aggregate, anonymised analytics on feature usage. We do not perform individual-level behavioural profiling for advertising.</li>
          </ul>
        </section>

        {/* 4. AI Training Statement */}
        <section className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-6">
          <h2 className="text-xl font-bold text-white mb-3">4. AI Training — We Do Not Train on Your Content</h2>
          <p>
            <strong className="text-white/90">memacta does not use your uploaded photos, Persona data, prompts, or generated outputs to train foundational AI models</strong>, now or in the future, without your explicit opt-in consent. Your creative assets belong to you. Any future opt-in programme will be clearly presented, voluntary, and compensated.
          </p>
        </section>

        {/* 5. Who We Share With */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">5. Data Processors and Third-Party Services</h2>
          <p className="mb-4">memacta uses the following sub-processors. Each receives only the minimum data required for their function:</p>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white/90 mb-1">fal.ai — AI Model Inference</h3>
              <p className="text-sm">Receives prompts, reference images, LoRA parameters, and model configurations to execute generation requests. Outputs are returned to memacta and stored on your behalf. <a href="https://fal.ai/privacy" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white/90 mb-1">Stripe — Payment Processing</h3>
              <p className="text-sm">Handles subscription billing and credit pack purchases. Stripe stores payment instrument details; we receive only a customer token and billing status. <a href="https://stripe.com/privacy" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white/90 mb-1">Resend — Transactional Email</h3>
              <p className="text-sm">Sends verification, password reset, and notification emails. Receives your email address and the email body. <a href="https://resend.com/privacy" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white/90 mb-1">Supabase — Database and Storage</h3>
              <p className="text-sm">Hosts the PostgreSQL database containing your account, library, credit ledger, and Persona data. Also provides object storage for reference photos and generated media files. <a href="https://supabase.com/privacy" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white/90 mb-1">Sentry — Error Monitoring</h3>
              <p className="text-sm">Captures application errors and performance traces. May receive truncated stack traces, browser metadata, and anonymised user IDs. No prompt content or generated media is forwarded to Sentry. <a href="https://sentry.io/privacy/" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white/90 mb-1">Upstash — Rate Limiting</h3>
              <p className="text-sm">A Redis-compatible store used to track per-user request counts for rate limiting. Receives anonymised user or IP identifiers and request counts. No prompt or media content is stored. <a href="https://upstash.com/privacy" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white/90 mb-1">Vercel — Hosting and Edge Network</h3>
              <p className="text-sm">Hosts and serves the memacta web application. Vercel logs include IP addresses, request paths, and response codes for up to 30 days. <a href="https://vercel.com/legal/privacy-policy" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
            </div>
          </div>
        </section>

        {/* 6. Cookies */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">6. Cookies and Analytics</h2>
          <p className="mb-2">We use the following cookies:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-white/90">Session cookie (next-auth.session-token):</strong> secure, HttpOnly, Strict SameSite. Required to maintain your login session.</li>
            <li><strong className="text-white/90">CSRF token (next-auth.csrf-token):</strong> required for form submission security.</li>
            <li><strong className="text-white/90">Anonymous generation counter:</strong> a first-party cookie tracking how many free generations an unsigned-out visitor has used. Expires after 7 days.</li>
          </ul>
          <p className="mt-3">We do not use third-party advertising cookies. We do not use Google Analytics, Meta Pixel, or similar tracking scripts.</p>
        </section>

        {/* 7. Data Retention */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">7. Data Retention</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-white/90">Account data and generation history:</strong> retained while your account is active. After 12 months of inactivity your account is flagged for archive; you will receive an email notification before deletion.</li>
            <li><strong className="text-white/90">Biometric data (face embeddings):</strong> deleted within 30 days of Persona deletion or 12 months after last use, whichever is sooner.</li>
            <li><strong className="text-white/90">On-request deletion:</strong> permanent deletion within 30 days of a verified deletion request.</li>
            <li><strong className="text-white/90">Server / error logs:</strong> up to 30 days (Vercel) and up to 90 days (Sentry), then auto-expired.</li>
            <li><strong className="text-white/90">Billing records:</strong> retained for 7 years as required by tax and accounting regulations.</li>
          </ul>
        </section>

        {/* 8. User Rights */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">8. Your Rights</h2>
          <p className="mb-3">Depending on your jurisdiction you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-white/90">Access (GDPR Art. 15):</strong> request a copy of the personal data we hold about you.</li>
            <li><strong className="text-white/90">Rectification (GDPR Art. 16):</strong> correct inaccurate data via <Link href="/account" className="underline hover:text-white">Account Settings</Link>.</li>
            <li><strong className="text-white/90">Erasure (GDPR Art. 17 / CCPA):</strong> delete your account and all associated data.</li>
            <li><strong className="text-white/90">Portability (GDPR Art. 20):</strong> export your generation history and Persona LoRA files on request.</li>
            <li><strong className="text-white/90">Restriction and objection (GDPR Art. 18–19):</strong> restrict specific processing activities.</li>
            <li><strong className="text-white/90">Opt-out of sale (CCPA / CPRA):</strong> we do not sell personal data. Nothing to opt out of.</li>
          </ul>
          <p className="mt-3">To exercise any right, email <a href="mailto:privacy@memacta.ai" className="underline hover:text-white">privacy@memacta.ai</a>. We respond within 30 days. Identity verification may be required for deletion requests.</p>
        </section>

        {/* 9. Children */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">9. Children's Privacy</h2>
          <p>memacta is not available to users under 18. We do not knowingly collect data from minors. Persona photo uploads are screened for estimated age; uploads that appear to depict a minor are automatically rejected. If you believe a minor has provided us data, contact <a href="mailto:privacy@memacta.ai" className="underline hover:text-white">privacy@memacta.ai</a> and we will investigate and delete within 72 hours.</p>
        </section>

        {/* 10. Contact */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">10. Contact</h2>
          {/* [USER TO FILL] — Replace with real DPO/privacy contact and mailing address */}
          <p>
            For all privacy-related enquiries: <a href="mailto:privacy@memacta.ai" className="underline hover:text-white">privacy@memacta.ai</a>.
            {" "}Mailing address: <span className="text-white/90 font-semibold">[USER TO FILL: company mailing address]</span>.
            {" "}Data Protection Officer (if applicable): <span className="text-white/90 font-semibold">[USER TO FILL: DPO name and contact or "Not yet appointed — contact privacy@memacta.ai"]</span>.
          </p>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm text-white/40">
        <Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        <Link href="/legal/dmca" className="hover:text-white transition-colors">DMCA Policy</Link>
        <Link href="/legal/ai-likeness" className="hover:text-white transition-colors">AI Likeness Policy</Link>
        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
      </div>
    </main>
  );
}
