import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import Link from "next/link";
import MessageRow from "@/components/admin/message-row";

// Owner-only contact message triage. Not a real admin product — just a
// read/update view so the owner can see what testers are reporting
// without SSH-ing into Prisma Studio. Gated by ADMIN_EMAILS + a 404
// for everyone else so we don't advertise the route exists.

export const metadata = {
  title: "memacta – Admin: Messages",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type Status = "new" | "read" | "handled" | "spam";

const STATUS_TABS: { id: "all" | Status; label: string }[] = [
  { id: "new", label: "New" },
  { id: "read", label: "Read" },
  { id: "handled", label: "Handled" },
  { id: "spam", label: "Spam" },
  { id: "all", label: "All" },
];

function isValidStatus(s: string | undefined): s is Status {
  return s === "new" || s === "read" || s === "handled" || s === "spam";
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await auth();
  const email = session?.user?.email ?? null;

  if (!isAdminEmail(email)) {
    // 404 semantics so we don't leak the route to unauthenticated probes.
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center text-white/70">
        <h1 className="text-2xl font-bold mb-2">Not found</h1>
        <p>This page doesn&apos;t exist.</p>
      </main>
    );
  }

  const params = await searchParams;
  const filter = isValidStatus(params.status) ? params.status : undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const PAGE_SIZE = 50;

  const [messages, counts] = await Promise.all([
    prisma.contactMessage.findMany({
      where: filter ? { status: filter } : undefined,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.contactMessage.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countByStatus = new Map(
    counts.map((c) => [c.status, c._count._all])
  );
  const totalCount = counts.reduce((sum, c) => sum + c._count._all, 0);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Contact messages</h1>
        <Link
          href="/account"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          ← Back to account
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.id === "all"
              ? totalCount
              : countByStatus.get(tab.id) ?? 0;
          const href =
            tab.id === "all"
              ? "/admin/messages"
              : `/admin/messages?status=${tab.id}`;
          const active =
            (tab.id === "all" && !filter) || tab.id === filter;
          return (
            <Link
              key={tab.id}
              href={href}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                active
                  ? "bg-brand-gradient text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {tab.label}
              <span className="ml-2 opacity-70">{count}</span>
            </Link>
          );
        })}
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-[#181828] border border-white/10 text-white/60">
          No messages in this view.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <MessageRow
              key={m.id}
              message={{
                id: m.id,
                name: m.name,
                email: m.email,
                subject: m.subject,
                message: m.message,
                status: m.status,
                userId: m.userId,
                createdAt: m.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}

      {messages.length === PAGE_SIZE && (
        <div className="flex justify-between mt-6 text-sm">
          {page > 1 && (
            <Link
              href={`/admin/messages?${filter ? `status=${filter}&` : ""}page=${page - 1}`}
              className="text-white/70 hover:text-white"
            >
              ← Previous
            </Link>
          )}
          <Link
            href={`/admin/messages?${filter ? `status=${filter}&` : ""}page=${page + 1}`}
            className="text-white/70 hover:text-white ml-auto"
          >
            Next →
          </Link>
        </div>
      )}
    </main>
  );
}
