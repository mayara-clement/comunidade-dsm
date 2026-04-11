import { requireCommunityOwner } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard-shell";
import { CommunityOwnerPanel } from "@/components/community-owner-panel";

export default async function CommunityOwnerDashboardPage() {
  await requireCommunityOwner();

  return (
    <DashboardShell
      title="Painel da comunidade"
      subtitle="Convide novos membros e gerencie quem faz parte da sua comunidade."
      nav={[{ href: "/dashboard", label: "Início" }]}
    >
      <CommunityOwnerPanel />
    </DashboardShell>
  );
}
