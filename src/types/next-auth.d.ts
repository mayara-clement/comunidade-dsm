import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPlatformFounder: boolean;
      ownedCommunityId: string | null;
      memberCommunityId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    isPlatformFounder: boolean;
    ownedCommunityId: string | null;
    memberCommunityId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isPlatformFounder: boolean;
    ownedCommunityId: string | null;
    memberCommunityId: string | null;
  }
}
