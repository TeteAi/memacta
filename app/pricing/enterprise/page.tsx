import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EnterprisePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold mb-4 text-brand-gradient">
        Enterprise
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Custom solutions for large organizations
      </p>

      <div className="rounded-xl border border-border bg-card p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">Built for scale</h2>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="text-brand-cyan font-bold">&#10003;</span>
            Custom credit volume with bulk pricing
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-cyan font-bold">&#10003;</span>
            Dedicated infrastructure and priority queue
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-cyan font-bold">&#10003;</span>
            SSO / SAML authentication
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-cyan font-bold">&#10003;</span>
            Custom model fine-tuning and deployment
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-cyan font-bold">&#10003;</span>
            SLA guarantees with 99.9% uptime
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-cyan font-bold">&#10003;</span>
            24/7 premium support
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-cyan font-bold">&#10003;</span>
            Advanced analytics and reporting
          </li>
        </ul>
      </div>

      <div className="flex gap-4">
        <Link href="/contact">
          <Button size="lg">Contact Sales</Button>
        </Link>
        <Link href="/pricing">
          <Button variant="outline" size="lg">View All Plans</Button>
        </Link>
      </div>
    </main>
  );
}
