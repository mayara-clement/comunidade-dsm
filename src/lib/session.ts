import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireFounder() {
  const session = await requireAuth();
  if (session.user.role !== "FOUNDER") {
    redirect("/dashboard/member");
  }
  return session;
}

export async function requireApprovedMember() {
  const session = await requireAuth();
  if (session.user.membershipStatus !== "APPROVED") {
    redirect("/login?error=pending_approval");
  }
  return session;
}
