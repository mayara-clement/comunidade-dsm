import { requirePlatformFounder } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard-shell";
import { FounderPanel } from "@/components/founder-panel";

export default async function FounderDashboardPage() {
  await requirePlatformFounder();

  return (
    <DashboardShell
      title="Painel do fundador"
      subtitle="Gerencie as comunidades da plataforma: gere convites para novos criadores, aprove, rejeite ou exclua comunidades."
      nav={[{ href: "/dashboard", label: "Início" }]}
    >
      <FounderPanel />
    </DashboardShell>
  );
}
