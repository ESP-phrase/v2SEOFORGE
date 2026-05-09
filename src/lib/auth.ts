import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (raw) => {
        const username = String(raw?.username ?? "").trim();
        const password = String(raw?.password ?? "");
        if (!username || !password) return null;
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });
        return { id: String(user.id), username: user.username, name: user.username };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = (user as { id: string }).id;
        token.username = (user as { username: string }).username;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token?.id) session.user.id = token.id as string;
      if (token?.username) session.user.username = token.username as string;
      return session;
    },
  },
});

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function hasUsers(): Promise<boolean> {
  return (await prisma.user.count()) > 0;
}
