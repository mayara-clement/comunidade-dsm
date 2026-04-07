import { requireAuth } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardIndexPage() {
  const session = await requireAuth();
  if (session.user.role === "FOUNDER") {
    redirect("/dashboard/founder");
  }
  redirect("/dashboard/member");
}
