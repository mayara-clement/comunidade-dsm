import { requireFounder } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard-shell";
import { FounderPanel } from "@/components/founder-panel";

export default async function FounderDashboardPage() {
  await requireFounder();

  return (
    <DashboardShell
      title="Painel do fundador"
      subtitle="Gere links de convite e aprove novos membros antes que eles possam acessar a comunidade."
      nav={[
        { href: "/dashboard/member", label: "Área de serviços" },
        { href: "/dashboard", label: "Início" },
      ]}
    >
      <FounderPanel />
    </DashboardShell>
  );
}
