import Link from "next/link";

export const metadata = {
  title: "DMCA / Content Removal | memacta",
  description: "How to submit a DMCA takedown notice or counter-notice for content on memacta.",
};

export default function DmcaPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">DMCA &amp; Content Removal</h1>
        <p className="text-sm text-white/40">Last updated: 2026-04-22</p>
      </div>

      <div className="space-y-10 text-white/70 leading-relaxed">

        {/* Intro */}
        <section>
          <p>
            memacta respects intellectual property rights and expects users to do the same. If you believe that content on memacta infringes your copyright, we will respond to valid takedown notices in accordance with the Digital Millennium Copyright Act (17 U.S.C. § 512) and equivalent laws in other jurisdictions.
          </p>
          <p className="mt-3">
            For AI likeness / right-of-publicity claims (someone generated your face without consent), please use the fast-path at <Link href="/contact?subject=likeness" className="underline hover:text-white">/contact?subject=likeness</Link> or the formal procedure on the <Link href="/legal/ai-likeness" className="underline hover:text-white">AI Likeness Policy</Link> page.
          </p>
        </section>

        {/* Designated Agent */}
        <section className="rounded-xl border border-white/20 bg-white/5 p-6">
          <h2 className="text-xl font-bold text-white mb-3">Designated DMCA Agent</h2>
          {/* [USER TO FILL] — All four fields below must be completed before launch */}
          <dl className="space-y-2 text-sm">
            <div className="flex gap-3">
              <dt className="text-white/50 w-24 flex-shrink-0">Name:</dt>
              <dd className="text-white/90 font-semibold">[USER TO FILL: Full legal name of DMCA agent]</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-white/50 w-24 flex-shrink-0">Address:</dt>
              <dd className="text-white/90 font-semibold">[USER TO FILL: Mailing address]</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-white/50 w-24 flex-shrink-0">Phone:</dt>
              <dd className="text-white/90 font-semibold">[USER TO FILL: Phone number]</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-white/50 w-24 flex-shrink-0">Email:</dt>
              <dd><a href="mailto:dmca@memacta.ai" className="underline hover:text-white">dmca@memacta.ai</a>{" "}<span className="text-white/90 font-semibold">[USER TO FILL: confirm or replace with verified email]</span></dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-white/40">Note: Filing a false DMCA notice may expose you to liability under 17 U.S.C. § 512(f). Only submit a notice if you have a good-faith belief the use is infringing.</p>
        </section>

        {/* How to File a Takedown */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">How to Submit a Takedown Notice</h2>
          <p className="mb-3">A valid DMCA notice must include all of the following:</p>
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong className="text-white/90">Identification of the copyrighted work</strong> — describe the original work you claim has been infringed (e.g., "my photograph titled X first published at URL Y").
            </li>
            <li>
              <strong className="text-white/90">Identification of the infringing content</strong> — the specific URL(s) on memacta where the allegedly infringing content appears.
            </li>
            <li>
              <strong className="text-white/90">Your contact information</strong> — full name, postal address, telephone number, and email address.
            </li>
            <li>
              <strong className="text-white/90">Good-faith statement</strong> — "I have a good-faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law."
            </li>
            <li>
              <strong className="text-white/90">Accuracy statement</strong> — "I declare under penalty of perjury that the information in this notification is accurate, and that I am the copyright owner or am authorized to act on behalf of the copyright owner."
            </li>
            <li>
              <strong className="text-white/90">Signature</strong> — your electronic or physical signature.
            </li>
          </ol>
          <p className="mt-4">Send the complete notice to <a href="mailto:dmca@memacta.ai" className="underline hover:text-white">dmca@memacta.ai</a>. Incomplete notices will not be processed.</p>
          <p className="mt-3">We will acknowledge receipt within 2 business days and act on valid notices within 10 business days.</p>
        </section>

        {/* Counter-Notice */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">Counter-Notice Procedure</h2>
          <p className="mb-3">
            If your content was removed and you believe the takedown was issued in error (e.g., you have a licence to use the work, or the claim is covered by fair use), you may submit a counter-notice. A valid counter-notice must include:
          </p>
          <ol className="list-decimal pl-6 space-y-3">
            <li>Identification of the content that was removed and its former location (URL).</li>
            <li>A statement under penalty of perjury that you have a good-faith belief the content was removed as a result of mistake or misidentification.</li>
            <li>Your name, address, telephone number, and email address.</li>
            <li>A statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which your address is located (or, if outside the US, any judicial district where memacta may be found).</li>
            <li>Your physical or electronic signature.</li>
          </ol>
          <p className="mt-4">Send counter-notices to <a href="mailto:dmca@memacta.ai" className="underline hover:text-white">dmca@memacta.ai</a>. If we receive a valid counter-notice, we will forward it to the original complainant. If the complainant does not file a court action within 10–14 business days, we may restore the removed content at our discretion.</p>
        </section>

        {/* Repeat Infringer Policy */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">Repeat Infringer Policy</h2>
          <p>
            memacta maintains a policy of terminating accounts of users who are determined to be repeat infringers. A user who receives two or more substantiated takedown notices within a 12-month period will have their account suspended pending review. A third substantiated notice within that period results in permanent termination without a refund.
          </p>
        </section>

        {/* Other Removals */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">Other Content Removal Requests</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-white/90">AI likeness / right of publicity:</strong> <Link href="/legal/ai-likeness" className="underline hover:text-white">AI Likeness Policy</Link> or <Link href="/contact?subject=likeness" className="underline hover:text-white">contact form</Link>.</li>
            <li><strong className="text-white/90">Defamation or harassment:</strong> <Link href="/contact" className="underline hover:text-white">Contact form</Link> with subject "Legal".</li>
            <li><strong className="text-white/90">CSAM or minor protection:</strong> Email <a href="mailto:safety@memacta.ai" className="underline hover:text-white">safety@memacta.ai</a> — we treat these as highest priority and report to NCMEC as required by law.</li>
          </ul>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm text-white/40">
        <Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        <Link href="/legal/ai-likeness" className="hover:text-white transition-colors">AI Likeness Policy</Link>
        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
      </div>
    </main>
  );
}
