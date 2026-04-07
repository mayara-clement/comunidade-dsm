"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const inputClass =
  "mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [token, setToken] = useState(initialToken);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

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
          onChange={(e) => setToken(e.target.value)}
          placeholder="Cole o token recebido"
          className={inputClass}
        />
      </div>
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
