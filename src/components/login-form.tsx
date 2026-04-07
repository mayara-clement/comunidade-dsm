"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const inputClass =
  "mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const qpError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(() => {
    if (qpError === "pending_approval") {
      return "Sua conta ainda está aguardando aprovação de um fundador.";
    }
    if (qpError === "CredentialsSignin" || qpError === "credentials") {
      return "Email ou senha incorretos.";
    }
    if (qpError) {
      return "Não foi possível entrar. Tente novamente.";
    }
    return null;
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      if (res.code === "pending_approval" || res.error.includes("pending")) {
        setMessage("Sua conta ainda está aguardando aprovação de um fundador.");
      } else {
        setMessage("Email ou senha incorretos.");
      }
      return;
    }
    if (res?.url) {
      router.push(res.url);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      {message ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {message}
        </div>
      ) : null}
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
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
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
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
