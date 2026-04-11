import { auth } from "@/auth";

import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ConnectAccounts from "@/components/social/connect-accounts";
import ScheduledPosts from "@/components/social/scheduled-posts";

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AccountPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Account</h1>
        <p className="text-white/70 mb-6">Sign in to view your account</p>
        <Link href="/api/auth/signin">
          <Button>Sign In</Button>
        </Link>
      </main>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      credits: true,
      createdAt: true,
    },
  });

  const purchases = await prisma.purchase.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const socialAccounts = await prisma.socialAccount.findMany({
    where: { userId },
    select: { id: true, platform: true, username: true },
  });

  const scheduledPosts = await prisma.scheduledPost.findMany({
    where: { userId },
    orderBy: { scheduledFor: "asc" },
    select: {
      id: true,
      platform: true,
      caption: true,
      scheduledFor: true,
      status: true,
      mediaType: true,
    },
  });

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12 text-center">
        <p className="text-white/40">User not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 bg-brand-gradient bg-clip-text text-transparent">
        Account
      </h1>

      <div className="rounded-2xl border border-white/15 bg-[#181828] p-6 mb-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-white/60">Email</p>
            <p className="font-medium" data-testid="account-email">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-white/60">Name</p>
            <p className="font-medium text-white">{user.name || <span className="text-white/50">Not set</span>}</p>
          </div>
          <div>
            <p className="text-sm text-white/60">Credits</p>
            <p className="font-medium text-brand-cyan" data-testid="account-credits">{user.credits}</p>
          </div>
          <div>
            <p className="text-sm text-white/60">Joined</p>
            <p className="font-medium">{user.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Purchase History</h2>
        <Link href="/pricing">
          <Button variant="outline" size="sm">Buy More Credits</Button>
        </Link>
      </div>

      <div className="mb-8">
        <ConnectAccounts connectedAccounts={socialAccounts} />
      </div>

      <div className="mb-8">
        <ScheduledPosts
          posts={scheduledPosts.map((p) => ({
            ...p,
            scheduledFor: p.scheduledFor.toISOString(),
          }))}
        />
      </div>

      {purchases.length === 0 ? (
        <p className="text-white/60 text-center py-8">No purchases yet. Visit the pricing page to get started!</p>
      ) : (
        <div className="rounded-2xl border border-white/15 bg-[#181828] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/15 bg-white/10">
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Credits</th>
                <th className="text-left p-3 font-medium">Amount</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p: { id: string; credits: number; amountUsd: number; status: string; createdAt: Date; userId: string; packageId: string; stripeSessionId: string | null }) => (
                <tr key={p.id} className="border-b border-white/10 last:border-0 hover:bg-white/10 transition-colors" data-testid="purchase-row">
                  <td className="p-3">{p.createdAt.toLocaleDateString()}</td>
                  <td className="p-3">{p.credits}</td>
                  <td className="p-3">{formatUsd(p.amountUsd)}</td>
                  <td className="p-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === "completed" ? "bg-green-500/20 text-green-400" :
                      p.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
