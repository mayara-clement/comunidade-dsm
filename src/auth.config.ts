import type { NextAuthConfig } from "next-auth";
import { getAuthSecret } from "@/lib/auth-env";

/**
 * Config compartilhada e compatível com Edge (sem Prisma/bcrypt).
 * O middleware importa só este arquivo para não estourar o limite de 1 MB na Vercel.
 */
export const authConfig = {
  trustHost: true,
  secret: getAuthSecret(),
  providers: [],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.membershipStatus = user.membershipStatus;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "FOUNDER" | "MEMBER";
        session.user.membershipStatus = token.membershipStatus as "PENDING" | "APPROVED";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
