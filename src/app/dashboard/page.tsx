import { requireAuth } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardIndexPage() {
  const session = await requireAuth();
  if (session.user.isPlatformFounder) {
    redirect("/dashboard/founder");
  }
  if (session.user.ownedCommunityId) {
    redirect("/dashboard/community-owner");
  }
  if (session.user.memberCommunityId) {
    redirect("/dashboard/member");
  }
  redirect("/login?error=pending_approval");
}
