import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requirePlatformFounder() {
  const session = await requireAuth();
  if (!session.user.isPlatformFounder) {
    if (session.user.ownedCommunityId) {
      redirect("/dashboard/community-owner");
    }
    if (session.user.memberCommunityId) {
      redirect("/dashboard/member");
    }
    redirect("/login");
  }
  return session;
}

export async function requireCommunityOwner() {
  const session = await requireAuth();
  if (!session.user.ownedCommunityId) {
    if (session.user.isPlatformFounder) {
      redirect("/dashboard/founder");
    }
    if (session.user.memberCommunityId) {
      redirect("/dashboard/member");
    }
    redirect("/login?error=pending_approval");
  }
  return session;
}

export async function requireApprovedCommunityMember() {
  const session = await requireAuth();
  if (!session.user.memberCommunityId) {
    if (session.user.ownedCommunityId) {
      redirect("/dashboard/community-owner");
    }
    if (session.user.isPlatformFounder) {
      redirect("/dashboard/founder");
    }
    redirect("/login?error=pending_approval");
  }
  return session;
}

/** @deprecated use requirePlatformFounder */
export async function requireFounder() {
  return requirePlatformFounder();
}

/** @deprecated use requireApprovedCommunityMember */
export async function requireApprovedMember() {
  return requireApprovedCommunityMember();
}
