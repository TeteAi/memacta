import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TeamPlanPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold mb-4 text-brand-gradient">
        Team Plan
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Collaborate with your crew
      </p>

      <div className="rounded-xl border border-border bg-card p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">Everything your team needs</h2>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="text-brand-cyan font-bold">&#10003;</span>
            Shared credit pool across team members
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-cyan font-bold">&#10003;</span>
            Centralized billing and usage dashboard
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-cyan font-bold">&#10003;</span>
            Collaborative project workspaces
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-cyan font-bold">&#10003;</span>
            Priority support with dedicated account manager
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-cyan font-bold">&#10003;</span>
            Team member roles and permissions
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-cyan font-bold">&#10003;</span>
            2,000 credits per month included
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
