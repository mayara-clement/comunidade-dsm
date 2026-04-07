import type { NextAuthConfig } from "next-auth";

/**
 * Config compartilhada e compatível com Edge (sem Prisma/bcrypt).
 * Não defina `secret` aqui: o NextAuth aplica AUTH_SECRET / NEXTAUTH_SECRET em runtime via setEnvDefaults.
 */
export const authConfig = {
  trustHost: true,
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
