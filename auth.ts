import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      // DEV STUB — no password check, replace before prod
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        if (!email) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { credits: true },
        });
        token.credits = dbUser?.credits ?? 0;
      } else if (token.id) {
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
        session.user.id = token.id as string;
        session.user.credits = (token.credits as number) ?? 0;
      }
      return session;
    },
  },
});
