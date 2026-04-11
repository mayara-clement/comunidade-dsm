import type { NextAuthConfig } from "next-auth";

/**
 * Config compartilhada e compatível com Edge (sem Prisma/bcrypt).
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
        token.isPlatformFounder = user.isPlatformFounder;
        token.ownedCommunityId = user.ownedCommunityId ?? null;
        token.memberCommunityId = user.memberCommunityId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isPlatformFounder = Boolean(token.isPlatformFounder);
        session.user.ownedCommunityId = (token.ownedCommunityId as string | null) ?? null;
        session.user.memberCommunityId = (token.memberCommunityId as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
