import Link from "next/link";

export const metadata = {
  title: "AI Likeness & Consent Policy | memacta",
  description: "What you can and cannot do with AI-generated likenesses on memacta, and how to report unauthorised use of your face.",
};

export default function AiLikenessPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">AI Likeness &amp; Consent Policy</h1>
        <p className="text-sm text-white/40">Last updated: 2026-04-22</p>
      </div>

      <div className="space-y-10 text-white/70 leading-relaxed">

        {/* Intro */}
        <section>
          <p>
            memacta&apos;s Persona feature lets you train an AI model on photographs of a real person to produce consistent, personalised Generations. This capability is powerful — and therefore carries significant legal and ethical obligations. This policy describes what is permitted, what is prohibited, and how we respond to complaints.
          </p>
        </section>

        {/* What You Can Do */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">1. Permitted Uses</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Train a Persona on photographs of <strong className="text-white/90">yourself</strong> and generate content featuring your own likeness.</li>
            <li>Train a Persona on photographs of <strong className="text-white/90">another adult person</strong> for whom you hold documented, revocable, written consent that covers AI-generated content — and only use that Persona in ways the consent covers.</li>
            <li>Generate stylised, non-photorealistic art, avatars, or character designs inspired by (but not identifying) a real person, provided the output is clearly artistic and not likely to be mistaken for a real photograph or video of that person.</li>
          </ul>
        </section>

        {/* What You Cannot Do */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">2. Prohibited Uses</h2>
          <p className="mb-3">You may <strong className="text-white/90">not</strong> use memacta to:</p>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              <strong className="text-white/90">Generate content featuring celebrities, public figures, or politicians</strong> without their documented consent — regardless of how realistic or stylised the output is. Likeness rights (right of publicity) are recognised under California Civil Code § 3344, Texas Civil Practice &amp; Remedies Code § 143, the Tennessee Personal Rights Protection Act, and EU General Data Protection Regulation Art. 9.
            </li>
            <li>
              <strong className="text-white/90">Generate content featuring anyone other than yourself</strong> unless you possess and can produce written consent from that person covering AI-generated imagery.
            </li>
            <li>
              <strong className="text-white/90">Generate content depicting minors (under 18)</strong> in any context. Persona photos flagged by our age-estimation pipeline as depicting a minor are automatically rejected.
            </li>
            <li>
              <strong className="text-white/90">Generate sexually explicit content</strong> featuring any identifiable person — including yourself — unless you are on a plan tier where explicit content is explicitly enabled (currently not available on any tier) and you have provided a verified age attestation.
            </li>
            <li>
              <strong className="text-white/90">Use Generations for fraud, impersonation, defamation, or harassment</strong> — including creating fake statements, fabricating events, or placing a real person in a false context intended to deceive.
            </li>
            <li>
              <strong className="text-white/90">Create non-consensual intimate imagery (NCII / "deepfake porn")</strong> of any real person. This violates our Terms, is illegal in an increasing number of jurisdictions, and will result in immediate account termination and reporting to relevant authorities.
            </li>
          </ul>
        </section>

        {/* Regulatory Compliance */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">3. Regulatory Compliance</h2>
          <h3 className="text-base font-semibold text-white/90 mb-2">EU AI Act — Deepfake Disclosure</h3>
          <p className="mb-4">
            All content generated on memacta is marked with a <strong className="text-white/90">C2PA (Coalition for Content Provenance and Authenticity)</strong> provenance signal embedded in the file metadata, indicating it was produced by an AI system. Free-tier downloads additionally carry a visible watermark. This satisfies the EU AI Act (Regulation 2024/1689) Article 50 requirement that providers of AI systems capable of generating synthetic media disclose that content is artificially generated.
          </p>
          <h3 className="text-base font-semibold text-white/90 mb-2">US State AI Likeness Statutes</h3>
          <p className="mb-2">memacta is designed to comply with AI likeness and digital replica laws including:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li><strong>Texas:</strong> Relating to the use of an individual&apos;s likeness in synthetic media (HB 4337 / SB 2037 — 2023 session and amendments).</li>
            <li><strong>California:</strong> AB 602, AB 1228, SB 1047 and related legislation governing AI-generated depictions and performer rights.</li>
            <li><strong>Tennessee:</strong> ELVIS Act (Ensuring Likeness Voice and Image Security, 2024) — protecting recording artists and performers from AI vocal/likeness replication without consent.</li>
            <li><strong>Federal (US):</strong> We monitor proposed federal legislation including the NO FAKES Act and the DEFIANCE Act and will update our policies as these become law.</li>
          </ul>
          <p className="mt-3 text-sm">This list is not exhaustive. Additional state and national laws apply. If your jurisdiction has enacted AI likeness legislation not listed here, contact <a href="mailto:legal@memacta.ai" className="underline hover:text-white">legal@memacta.ai</a>.</p>
        </section>

        {/* How to Report */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">4. Reporting Unauthorised Use of Your Likeness</h2>
          <p className="mb-3">If you believe someone has generated content using your likeness on memacta without your consent, you have two paths:</p>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5">
              <h3 className="font-semibold text-white mb-2">Fast Path — Contact Form</h3>
              <p className="text-sm mb-3">For an expedited response (we aim to remove content within 24 hours of verification):</p>
              <Link
                href="/contact?subject=likeness"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition-all"
              >
                Report Likeness Violation
              </Link>
              <p className="text-xs text-white/40 mt-3">Include: your name, a photo ID proving you are the person depicted, and the URL of the content.</p>
            </div>
            <div className="p-5 rounded-xl border border-white/15 bg-white/5">
              <h3 className="font-semibold text-white mb-2">Formal DMCA / Legal Takedown</h3>
              <p className="text-sm">For formal right-of-publicity or copyright claims, follow the process described on the <Link href="/legal/dmca" className="underline hover:text-white">DMCA page</Link>. Send written notice to <a href="mailto:dmca@memacta.ai" className="underline hover:text-white">dmca@memacta.ai</a>.</p>
            </div>
          </div>
        </section>

        {/* Enforcement */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">5. How We Enforce This Policy</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-white/90">At upload:</strong> Reference photos are screened for estimated age, NSFW content, and known celebrity face signatures. Photos that fail these checks are rejected before a Persona is created.</li>
            <li><strong className="text-white/90">At generation:</strong> Prompts are moderated for names of public figures, harassment patterns, and explicit content markers.</li>
            <li><strong className="text-white/90">On report:</strong> Verified likeness complaints result in immediate content removal, review of the offending account, and (for severe violations) referral to law enforcement.</li>
            <li><strong className="text-white/90">Repeat violators:</strong> Accounts with two or more substantiated likeness violations are permanently terminated. We cooperate fully with law-enforcement investigations related to non-consensual intimate imagery.</li>
          </ul>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm text-white/40">
        <Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        <Link href="/legal/dmca" className="hover:text-white transition-colors">DMCA Policy</Link>
        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
      </div>
    </main>
  );
}
