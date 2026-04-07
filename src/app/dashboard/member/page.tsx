import { requireApprovedMember } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard-shell";
import { MemberPanel } from "@/components/member-panel";
import { auth } from "@/auth";

export default async function MemberDashboardPage() {
  await requireApprovedMember();
  const session = await auth();

  const extraNav =
    session?.user?.role === "FOUNDER"
      ? [
          { href: "/dashboard/founder", label: "Painel do fundador" },
          { href: "/dashboard", label: "Início" },
        ]
      : [{ href: "/dashboard", label: "Início" }];

  return (
    <DashboardShell
      title="Sua área na comunidade"
      subtitle="Publique serviços, explore o mercado interno e acompanhe solicitações."
      nav={extraNav}
    >
      <MemberPanel />
    </DashboardShell>
  );
}
