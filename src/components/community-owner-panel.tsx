"use client";

import { useCallback, useEffect, useState } from "react";

type MemberRow = {
  membershipId: string;
  userId: string;
  email: string;
  name: string | null;
  createdAt?: string;
};

const btnGhost =
  "rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800 shadow-sm transition hover:border-teal-400/50 hover:text-teal-900";

export function CommunityOwnerPanel() {
  const [pending, setPending] = useState<MemberRow[]>([]);
  const [approved, setApproved] = useState<MemberRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [rawToken, setRawToken] = useState<string | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const [pendRes, apprRes] = await Promise.all([
        fetch("/api/community/members/pending"),
        fetch("/api/community/members/approved"),
      ]);
      const pendData = await pendRes.json().catch(() => ({}));
      const apprData = await apprRes.json().catch(() => ({}));
      if (!pendRes.ok) {
        setListError(pendData?.error ?? "Não foi possível carregar membros pendentes.");
        return;
      }
      if (!apprRes.ok) {
        setListError(apprData?.error ?? "Não foi possível carregar membros aprovados.");
        return;
      }
      setPending(pendData.members ?? []);
      setApproved(apprData.members ?? []);
    } catch {
      setListError("Erro de rede ao carregar membros.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  async function createInvite() {
    setInviteBusy(true);
    setInviteError(null);
    setInviteUrl(null);
    setRawToken(null);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "COMMUNITY_MEMBER" }),
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

  async function approveMember(membershipId: string) {
    setActionBusyId(membershipId);
    setActionError(null);
    try {
      const res = await fetch(`/api/community/members/${membershipId}/approve`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(data?.error ?? "Não foi possível aprovar o membro.");
        return;
      }
      await loadMembers();
    } catch {
      setActionError("Erro de rede ao aprovar.");
    } finally {
      setActionBusyId(null);
    }
  }

  async function removeMember(membershipId: string) {
    if (!confirm("Tem certeza que deseja remover este membro da comunidade?")) {
      return;
    }
    setActionBusyId(membershipId);
    setActionError(null);
    try {
      const res = await fetch(`/api/community/members/${membershipId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(data?.error ?? "Não foi possível remover o membro.");
        return;
      }
      await loadMembers();
    } catch {
      setActionError("Erro de rede ao remover.");
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

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-3xl border border-[var(--app-line)] bg-[var(--app-card)] p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-800">Convidar membros</h2>
            <p className="mt-1 text-sm text-[var(--app-muted)]">
              Gere um link de acesso para que alguém entre na sua comunidade.
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
            <p className="text-sm font-medium text-emerald-950">Link de convite</p>
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
            <h2 className="text-lg font-semibold text-stone-800">Solicitações pendentes</h2>
            <p className="mt-1 text-sm text-[var(--app-muted)]">
              Membros aguardando aprovação para entrar na comunidade.
            </p>
          </div>
          <button type="button" onClick={() => void loadMembers()} className={btnGhost}>
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
            <p className="text-sm text-[var(--app-muted)]">Não há solicitações pendentes.</p>
          ) : (
            pending.map((m) => (
              <div
                key={m.membershipId}
                className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-stone-900">{m.email}</p>
                  {m.name ? <p className="text-sm text-[var(--app-muted)]">{m.name}</p> : null}
                  {m.createdAt ? (
                    <p className="mt-1 text-xs text-stone-500">
                      Solicitado em {new Date(m.createdAt).toLocaleString("pt-BR")}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={actionBusyId === m.membershipId}
                  onClick={() => void approveMember(m.membershipId)}
                  className="h-9 rounded-2xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionBusyId === m.membershipId ? "Aprovando…" : "Aprovar"}
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {approved.length > 0 ? (
        <section className="rounded-3xl border border-[var(--app-line)] bg-[var(--app-card)] p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-stone-800">Membros ativos</h2>
          <div className="mt-5 space-y-3">
            {approved.map((m) => (
              <div
                key={m.membershipId}
                className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-stone-900">{m.email}</p>
                  {m.name ? (
                    <p className="text-sm text-[var(--app-muted)]">{m.name}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={actionBusyId === m.membershipId}
                  onClick={() => void removeMember(m.membershipId)}
                  className="h-9 shrink-0 rounded-2xl border border-rose-300 bg-rose-50 px-4 text-xs font-semibold text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionBusyId === m.membershipId ? "Removendo…" : "Remover"}
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
