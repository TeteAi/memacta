import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  // Trust the request Host header. Without this, NextAuth pins the OAuth
  // callback URL to whatever AUTH_URL points at — and if AUTH_URL is the
  // vercel.app preview URL while users browse via the custom domain, every
  // Google sign-in fails because Google rejects the cross-host redirect.
  // Vercel strips/sets Host correctly so this is safe in production.
  trustHost: true,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  providers: [
    // Google OAuth — add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),

    // Apple OAuth — add APPLE_ID and APPLE_SECRET to .env
    // Apple({
    //   clientId: process.env.APPLE_ID ?? "",
    //   clientSecret: process.env.APPLE_SECRET ?? "",
    // }),

    // Discord OAuth — add DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET to .env
    // Discord({
    //   clientId: process.env.DISCORD_CLIENT_ID ?? "",
    //   clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    // }),

    // Email + Password
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        // If user has a password, verify it
        if (user.password) {
          if (!password) return null;
          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null;
        } else {
          // User created via OAuth (no password) — allow login if no password provided
          // This handles the case where OAuth users try the credentials form
          if (password) return null; // They typed a password but have none set
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
      }
      // Refresh credits on every token refresh
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { credits: true },
        });
        if (dbUser) token.credits = dbUser.credits;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { credits: number }).credits =
          (token.credits as number) ?? 0;
      }
      return session;
    },
  },
  events: {
    // Give signup bonus when a new user is created via OAuth.
    // NOTE: the schema default for User.credits is 100 — we intentionally
    // write the same value here so the CreditTransaction log stays consistent
    // with the balance. Bumping either requires bumping both.
    async createUser({ user }) {
      if (user.id) {
        const SIGNUP_BONUS = 100;
        await prisma.user.update({
          where: { id: user.id },
          data: { credits: SIGNUP_BONUS },
        });
        await prisma.creditTransaction.create({
          data: {
            userId: user.id,
            amount: SIGNUP_BONUS,
            balance: SIGNUP_BONUS,
            type: "signup",
            description: `Welcome bonus — ${SIGNUP_BONUS} free credits`,
          },
        });
      }
    },
  },
});
