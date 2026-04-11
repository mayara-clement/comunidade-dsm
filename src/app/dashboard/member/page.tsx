import { requireApprovedCommunityMember } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard-shell";
import { MemberPanel } from "@/components/member-panel";

export default async function MemberDashboardPage() {
  await requireApprovedCommunityMember();

  return (
    <DashboardShell
      title="Sua área na comunidade"
      subtitle="Publique serviços, explore o mercado interno e acompanhe solicitações."
      nav={[{ href: "/dashboard", label: "Início" }]}
    >
      <MemberPanel />
    </DashboardShell>
  );
}
