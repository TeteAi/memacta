import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * Self-service account deletion (DELETE /api/account/delete).
 *
 * GDPR commitment we made in the privacy policy: users can request deletion
 * of their account and associated personal data. This endpoint performs it
 * immediately rather than queueing a ticket.
 *
 * Data handling:
 *  - Private data (generations, characters, projects, likes, purchases,
 *    credit ledger, subscriptions, OAuth tokens, scheduled posts, social
 *    connections, NextAuth accounts + sessions) → deleted.
 *  - Public posts (community gallery) → anonymised (userId set to null)
 *    so the gallery doesn't develop holes, but nothing links back to the
 *    departed user. Likes on those posts are removed.
 *
 * Everything runs in one Prisma transaction so a partial failure doesn't
 * leave the account in a zombie state.
 */
export async function DELETE() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Private artifacts — delete outright.
      await tx.like.deleteMany({ where: { userId } });
      await tx.purchase.deleteMany({ where: { userId } });
      await tx.generation.deleteMany({ where: { userId } });
      await tx.character.deleteMany({ where: { userId } });
      await tx.project.deleteMany({ where: { userId } });

      // Public posts — anonymise rather than delete, so the community
      // gallery doesn't lose content. Nothing links back to the user.
      await tx.post.updateMany({
        where: { userId },
        data: { userId: null },
      });

      // Contact messages — scrub PII (name + email) but keep the body so
      // we still have the bug report context for triage. ContactMessage
      // has no foreign key on userId (just an optional string column),
      // so the cascade on user.delete() doesn't touch these.
      await tx.contactMessage.updateMany({
        where: { userId },
        data: {
          userId: null,
          name: "[deleted]",
          email: "[deleted]",
        },
      });

      // The User row — cascades to Account, Session, Subscription,
      // CreditTransaction, SocialAccount, ScheduledPost via the schema.
      await tx.user.delete({ where: { id: userId } });
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        event: "account.delete_failed",
        userId,
        error: err instanceof Error ? err.message : String(err),
      })
    );
    return NextResponse.json(
      {
        error: "delete_failed",
        message: "We couldn't delete your account. Please try again or contact support.",
      },
      { status: 500 }
    );
  }

  // Clear the NextAuth session cookies as we walk out — the user is gone
  // from the DB, but their browser might still hold a session cookie that
  // would produce cryptic 404s on next request.
  const res = NextResponse.json({ success: true });
  for (const name of [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.session-token",
    "__Secure-authjs.session-token",
  ]) {
    res.cookies.set(name, "", { maxAge: 0, path: "/" });
  }
  return res;
}
