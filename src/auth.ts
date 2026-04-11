import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";

class PendingApprovalError extends CredentialsSignin {
  code = "pending_approval";
}

const { providers: _providersFromShared, ...sharedAuth } = authConfig;

function canSignIn(user: {
  isPlatformFounder: boolean;
  ownedCommunities: { status: string }[];
  communityMemberships: { status: string }[];
}): boolean {
  if (user.isPlatformFounder) {
    return true;
  }
  const hasActiveOwned = user.ownedCommunities.some((c) => c.status === "ACTIVE");
  if (hasActiveOwned) {
    return true;
  }
  const hasApprovedMember = user.communityMemberships.some((m) => m.status === "APPROVED");
  return hasApprovedMember;
}

function shouldBlockAsPending(user: {
  isPlatformFounder: boolean;
  ownedCommunities: { status: string }[];
  communityMemberships: { status: string }[];
}): boolean {
  if (user.isPlatformFounder) {
    return false;
  }
  if (canSignIn(user)) {
    return false;
  }
  const waitingOwner = user.ownedCommunities.some((c) => c.status === "PENDING_APPROVAL");
  const waitingMember = user.communityMemberships.some((m) => m.status === "PENDING");
  const onlyRejected =
    user.ownedCommunities.length > 0 &&
    user.ownedCommunities.every((c) => c.status === "REJECTED") &&
    user.communityMemberships.length === 0;
  return waitingOwner || waitingMember || onlyRejected;
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  ...sharedAuth,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const { prisma } = await import("@/lib/prisma");
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email?.trim() || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() },
          include: {
            ownedCommunities: true,
            communityMemberships: true,
          },
        });
        if (!user) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        if (shouldBlockAsPending(user)) {
          throw new PendingApprovalError();
        }

        if (!canSignIn(user)) {
          throw new PendingApprovalError();
        }

        const activeOwned = user.ownedCommunities.find((c) => c.status === "ACTIVE");
        const approvedMembership = user.communityMemberships.find((m) => m.status === "APPROVED");

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          isPlatformFounder: user.isPlatformFounder,
          ownedCommunityId: activeOwned?.id ?? null,
          memberCommunityId: approvedMembership?.communityId ?? null,
        };
      },
    }),
  ],
}));
