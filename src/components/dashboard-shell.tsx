import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

type DashboardShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  nav?: { href: string; label: string }[];
};

export function DashboardShell({ children, title, subtitle, nav }: DashboardShellProps) {
  return (
    <div className="min-h-dvh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <header className="sticky top-0 z-20 border-b border-[var(--app-line)] bg-[var(--app-header)]/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[var(--app-muted)] hover:text-[var(--app-fg)]"
            >
              Comunidade
            </Link>
            <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
            {subtitle ? (
              <p className="mt-1 max-w-2xl text-sm text-[var(--app-muted)]">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {nav?.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-[var(--app-line)] bg-[var(--app-card)] px-3 py-2 text-sm font-medium text-[var(--app-fg)] transition hover:border-[var(--app-accent)] hover:text-[var(--app-accent)]"
              >
                {item.label}
              </Link>
            ))}
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
