"use client";

import { useCallback, useEffect, useState } from "react";

type CommunityRow = {
  id: string;
  name: string;
  slug: string;
  status: "PENDING_APPROVAL" | "ACTIVE" | "REJECTED";
  createdAt: string;
  owner: { id: string; email: string; name: string | null };
};

const btnGhost =
  "rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800 shadow-sm transition hover:border-teal-400/50 hover:text-teal-900";

const statusLabel: Record<CommunityRow["status"], string> = {
  PENDING_APPROVAL: "Aguardando aprovação",
  ACTIVE: "Ativa",
  REJECTED: "Rejeitada",
};

const statusColor: Record<CommunityRow["status"], string> = {
  PENDING_APPROVAL: "border-amber-200 bg-amber-50 text-amber-900",
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-900",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-900",
};

export function FounderPanel() {
  const [communities, setCommunities] = useState<CommunityRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [rawToken, setRawToken] = useState<string | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadCommunities = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const res = await fetch("/api/platform/communities");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setListError(data?.error ?? "Não foi possível carregar as comunidades.");
        return;
      }
      setCommunities(data.communities ?? []);
    } catch {
      setListError("Erro de rede ao carregar comunidades.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadCommunities();
  }, [loadCommunities]);

  async function createInvite() {
    setInviteBusy(true);
    setInviteError(null);
    setInviteUrl(null);
    setRawToken(null);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "NEW_COMMUNITY_OWNER" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInviteError(data?.error ?? "Não foi possível gerar o convite.");
        return;
      }
      setInviteUrl(data.inviteUrl ?? null);
      setRawToken(data.token ?? null);
    } catch {
      setInviteError("Erro de rede.");
    } finally {
      setInviteBusy(false);
    }
  }

  async function approve(id: string) {
    setActionBusyId(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/platform/communities/${id}/approve`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(data?.error ?? "Não foi possível aprovar.");
        return;
      }
      await loadCommunities();
    } catch {
      setActionError("Erro de rede ao aprovar.");
    } finally {
      setActionBusyId(null);
    }
  }

  async function reject(id: string) {
    setActionBusyId(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/platform/communities/${id}/reject`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(data?.error ?? "Não foi possível rejeitar.");
        return;
      }
      await loadCommunities();
    } catch {
      setActionError("Erro de rede ao rejeitar.");
    } finally {
      setActionBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta comunidade? Esta ação não pode ser desfeita.")) {
      return;
    }
    setActionBusyId(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/platform/communities/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(data?.error ?? "Não foi possível excluir.");
        return;
      }
      await loadCommunities();
    } catch {
      setActionError("Erro de rede ao excluir.");
    } finally {
      setActionBusyId(null);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  const pending = communities.filter((c) => c.status === "PENDING_APPROVAL");
  const others = communities.filter((c) => c.status !== "PENDING_APPROVAL");

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-3xl border border-[var(--app-line)] bg-[var(--app-card)] p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-800">Convites para novos criadores</h2>
            <p className="mt-1 text-sm text-[var(--app-muted)]">
              Gere um link exclusivo para que alguém crie uma nova comunidade na plataforma.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void createInvite()}
            disabled={inviteBusy}
            className="h-10 shrink-0 rounded-2xl bg-teal-700 px-4 text-sm font-semibold text-white shadow-md shadow-teal-700/15 transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {inviteBusy ? "Gerando…" : "Novo convite"}
          </button>
        </div>

        {inviteError ? (
          <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-950">
            {inviteError}
          </p>
        ) : null}

        {inviteUrl ? (
          <div className="mt-5 space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
            <p className="text-sm font-medium text-emerald-950">Link de cadastro</p>
            <div className="break-all rounded-2xl border border-stone-200 bg-white p-3 text-xs text-stone-800">
              {inviteUrl}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void copy(inviteUrl)} className={btnGhost}>
                Copiar link
              </button>
              {rawToken ? (
                <button type="button" onClick={() => void copy(rawToken)} className={btnGhost}>
                  Copiar token
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-[var(--app-muted)]">
            Dica: envie o link por um canal seguro. Cada convite é de uso único após o cadastro.
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-[var(--app-line)] bg-[var(--app-card)] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-stone-800">Comunidades pendentes</h2>
            <p className="mt-1 text-sm text-[var(--app-muted)]">
              Aprove ou rejeite comunidades aguardando liberação.
            </p>
          </div>
          <button type="button" onClick={() => void loadCommunities()} className={btnGhost}>
            Atualizar
          </button>
        </div>

        {actionError ? (
          <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-950">
            {actionError}
          </p>
        ) : null}

        <div className="mt-5 space-y-3">
          {loadingList ? (
            <p className="text-sm text-[var(--app-muted)]">Carregando…</p>
          ) : pending.length === 0 ? (
            <p className="text-sm text-[var(--app-muted)]">Não há comunidades aguardando aprovação.</p>
          ) : (
            pending.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-stone-900">{c.name}</p>
                  <p className="text-xs text-[var(--app-muted)]">
                    Criador: {c.owner.name ?? c.owner.email}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    Solicitado em {new Date(c.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={actionBusyId === c.id}
                    onClick={() => void approve(c.id)}
                    className="h-9 rounded-2xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionBusyId === c.id ? "…" : "Aprovar"}
                  </button>
                  <button
                    type="button"
                    disabled={actionBusyId === c.id}
                    onClick={() => void reject(c.id)}
                    className="h-9 rounded-2xl border border-rose-300 bg-rose-50 px-4 text-xs font-semibold text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {others.length > 0 ? (
        <section className="rounded-3xl border border-[var(--app-line)] bg-[var(--app-card)] p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-stone-800">Todas as comunidades</h2>
          <div className="mt-5 space-y-3">
            {listError ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-950">
                {listError}
              </p>
            ) : null}
            {others.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-stone-900">{c.name}</p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColor[c.status]}`}
                    >
                      {statusLabel[c.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--app-muted)]">
                    Criador: {c.owner.name ?? c.owner.email}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={actionBusyId === c.id}
                  onClick={() => void remove(c.id)}
                  className="h-9 shrink-0 rounded-2xl border border-rose-300 bg-rose-50 px-4 text-xs font-semibold text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionBusyId === c.id ? "Excluindo…" : "Excluir"}
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
