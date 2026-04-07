import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "FOUNDER" | "MEMBER";
      membershipStatus: "PENDING" | "APPROVED";
    } & DefaultSession["user"];
  }

  interface User {
    role: "FOUNDER" | "MEMBER";
    membershipStatus: "PENDING" | "APPROVED";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "FOUNDER" | "MEMBER";
    membershipStatus: "PENDING" | "APPROVED";
  }
}
