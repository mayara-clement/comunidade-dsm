"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const inputClass =
  "mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15";

type InviteKind = "NEW_COMMUNITY_OWNER" | "COMMUNITY_MEMBER" | null;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [token, setToken] = useState(initialToken);
  const [name, setName] = useState("");
  const [communityName, setCommunityName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [inviteKind, setInviteKind] = useState<InviteKind>(null);
  const [inviteCommunityName, setInviteCommunityName] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const checkToken = useCallback(async (t: string) => {
    const trimmed = t.trim();
    if (trimmed.length < 8) {
      setInviteKind(null);
      setInviteCommunityName(null);
      setPreviewError(null);
      return;
    }
    try {
      const res = await fetch(`/api/invites/preview?token=${encodeURIComponent(trimmed)}`);
      const data = await res.json().catch(() => ({}));
      if (!data.valid) {
        setInviteKind(null);
        setInviteCommunityName(null);
        setPreviewError(data.error ?? "Convite inválido.");
        return;
      }
      setInviteKind(data.kind ?? null);
      setInviteCommunityName(data.communityName ?? null);
      setPreviewError(null);
    } catch {
      setInviteKind(null);
      setPreviewError(null);
    }
  }, []);

  useEffect(() => {
    if (initialToken) {
      void checkToken(initialToken);
    }
  }, [initialToken, checkToken]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setOk(false);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          email: email.trim().toLowerCase(),
          password,
          name: name.trim() || undefined,
          communityName: communityName.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.error ?? "Não foi possível concluir o cadastro.");
        return;
      }
      setOk(true);
      setMessage(data?.message ?? "Conta criada com sucesso.");
      router.prefetch("/login");
    } catch {
      setMessage("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      {message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : "border-rose-200 bg-rose-50 text-rose-950"
          }`}
        >
          {message}
        </div>
      ) : null}

      <div>
        <label htmlFor="token" className="block text-sm font-medium text-stone-700">
          Token do convite
        </label>
        <input
          id="token"
          name="token"
          required
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            void checkToken(e.target.value);
          }}
          placeholder="Cole o token recebido"
          className={inputClass}
        />
        {previewError ? (
          <p className="mt-1 text-xs text-rose-600">{previewError}</p>
        ) : null}
        {inviteKind === "COMMUNITY_MEMBER" && inviteCommunityName ? (
          <p className="mt-1 text-xs text-teal-700">
            Convite para a comunidade: <strong>{inviteCommunityName}</strong>
          </p>
        ) : null}
        {inviteKind === "NEW_COMMUNITY_OWNER" ? (
          <p className="mt-1 text-xs text-teal-700">Convite para criar uma nova comunidade.</p>
        ) : null}
      </div>

      {inviteKind === "NEW_COMMUNITY_OWNER" ? (
        <div>
          <label htmlFor="communityName" className="block text-sm font-medium text-stone-700">
            Nome da comunidade
          </label>
          <input
            id="communityName"
            name="communityName"
            required
            value={communityName}
            onChange={(e) => setCommunityName(e.target.value)}
            placeholder="Ex.: Comunidade de Tecnologia"
            className={inputClass}
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-stone-700">
          Nome (opcional)
        </label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-stone-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-stone-700">
          Senha (mín. 8 caracteres)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-teal-700 text-sm font-semibold text-white shadow-md shadow-teal-700/20 transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Criando conta…" : "Criar conta"}
      </button>
    </form>
  );
}
