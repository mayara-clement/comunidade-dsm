"use client";

import { useCallback, useEffect, useState } from "react";

type ServiceRow = {
  id: string;
  title: string;
  description: string;
  priceLabel: string | null;
  providerId: string;
  provider?: { id: string; name: string | null; email: string };
};

type RequestRow = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  message: string | null;
  createdAt: string;
  service: { id: string; title: string };
  provider?: { name: string | null; email: string };
  requester?: { name: string | null; email: string };
};

const fieldClass =
  "mt-2 w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15";

const btnOutline =
  "rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-teal-400/45 hover:text-teal-900";

export function MemberPanel() {
  const [tab, setTab] = useState<"market" | "mine" | "flow">("market");

  const [market, setMarket] = useState<ServiceRow[]>([]);
  const [mine, setMine] = useState<ServiceRow[]>([]);
  const [sent, setSent] = useState<RequestRow[]>([]);
  const [received, setReceived] = useState<RequestRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  const [hireNote, setHireNote] = useState<Record<string, string>>({});
  const [hireBusy, setHireBusy] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mRes, myRes, rRes] = await Promise.all([
        fetch("/api/services?marketplace=1"),
        fetch("/api/services?mine=1"),
        fetch("/api/service-requests"),
      ]);
      const mData = await mRes.json().catch(() => ({}));
      const myData = await myRes.json().catch(() => ({}));
      const rData = await rRes.json().catch(() => ({}));
      if (!mRes.ok) throw new Error(mData?.error ?? "Erro ao carregar marketplace.");
      if (!myRes.ok) throw new Error(myData?.error ?? "Erro ao carregar seus serviços.");
      if (!rRes.ok) throw new Error(rData?.error ?? "Erro ao carregar solicitações.");
      setMarket(mData.services ?? []);
      setMine(myData.services ?? []);
      setSent(rData.sent ?? []);
      setReceived(rData.received ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function createService(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateMsg(null);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priceLabel: priceLabel.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCreateMsg(data?.error ?? "Não foi possível publicar.");
        return;
      }
      setTitle("");
      setDescription("");
      setPriceLabel("");
      setCreateMsg("Serviço publicado.");
      await loadAll();
    } catch {
      setCreateMsg("Erro de rede.");
    } finally {
      setCreating(false);
    }
  }

  async function hire(serviceId: string) {
    setHireBusy(serviceId);
    try {
      const message = hireNote[serviceId]?.trim() || null;
      const res = await fetch(`/api/services/${serviceId}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Não foi possível solicitar.");
        return;
      }
      setHireNote((prev) => ({ ...prev, [serviceId]: "" }));
      await loadAll();
      setTab("flow");
    } catch {
      setError("Erro de rede ao solicitar.");
    } finally {
      setHireBusy(null);
    }
  }

  async function respondRequest(id: string, status: "ACCEPTED" | "DECLINED") {
    try {
      const res = await fetch(`/api/service-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Não foi possível atualizar.");
        return;
      }
      await loadAll();
    } catch {
      setError("Erro de rede.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-3xl border border-[var(--app-line)] bg-[var(--app-card)] p-2 shadow-sm">
        {[
          { id: "market" as const, label: "Contratar serviços" },
          { id: "mine" as const, label: "Meus serviços" },
          { id: "flow" as const, label: "Solicitações" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-teal-700 text-white shadow-md shadow-teal-700/20"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={() => void loadAll()} className={`ml-auto ${btnOutline}`}>
          Atualizar
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-950">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--app-muted)]">Carregando…</p>
      ) : null}

      {tab === "market" ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {market.length === 0 ? (
            <p className="text-sm text-[var(--app-muted)]">
              Nenhum serviço disponível no momento — ou você já listou todos os seus próprios anúncios.
            </p>
          ) : (
            market.map((s) => (
              <article
                key={s.id}
                className="rounded-3xl border border-[var(--app-line)] bg-[var(--app-card)] p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-stone-900">{s.title}</h3>
                    <p className="mt-1 text-xs text-[var(--app-muted)]">
                      {s.provider?.name ?? s.provider?.email ?? "Membro"}
                    </p>
                  </div>
                  {s.priceLabel ? (
                    <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">
                      {s.priceLabel}
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-stone-600">{s.description}</p>
                <label className="mt-4 block text-xs font-semibold text-stone-700">
                  Mensagem (opcional)
                  <textarea
                    value={hireNote[s.id] ?? ""}
                    onChange={(e) => setHireNote((p) => ({ ...p, [s.id]: e.target.value }))}
                    rows={3}
                    className={fieldClass}
                  />
                </label>
                <button
                  type="button"
                  disabled={hireBusy === s.id}
                  onClick={() => void hire(s.id)}
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl border border-stone-200 bg-stone-100 px-4 text-sm font-semibold text-stone-900 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {hireBusy === s.id ? "Enviando…" : "Solicitar este serviço"}
                </button>
              </article>
            ))
          )}
        </section>
      ) : null}

      {tab === "mine" ? (
        <section className="grid gap-6 lg:grid-cols-5">
          <form
            onSubmit={createService}
            className="rounded-3xl border border-[var(--app-line)] bg-[var(--app-card)] p-6 shadow-sm lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-stone-900">Ofertar um serviço</h3>
            <p className="mt-1 text-sm text-[var(--app-muted)]">
              Descreva com clareza o que você entrega e como prefere combinar valores.
            </p>
            {createMsg ? (
              <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
                {createMsg}
              </p>
            ) : null}
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700" htmlFor="svc-title">
                  Título
                </label>
                <input
                  id="svc-title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700" htmlFor="svc-desc">
                  Descrição
                </label>
                <textarea
                  id="svc-desc"
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700" htmlFor="svc-price">
                  Preço / formato (opcional)
                </label>
                <input
                  id="svc-price"
                  value={priceLabel}
                  onChange={(e) => setPriceLabel(e.target.value)}
                  placeholder="Ex.: R$ 120/h ou combo mensal"
                  className={fieldClass}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-teal-700 text-sm font-semibold text-white shadow-md shadow-teal-700/15 transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Publicando…" : "Publicar serviço"}
            </button>
          </form>

          <div className="space-y-4 lg:col-span-3">
            <h3 className="text-lg font-semibold text-stone-900">Seus anúncios</h3>
            {mine.length === 0 ? (
              <p className="text-sm text-[var(--app-muted)]">Você ainda não publicou serviços.</p>
            ) : (
              mine.map((s) => (
                <article
                  key={s.id}
                  className="rounded-3xl border border-[var(--app-line)] bg-[var(--app-card)] p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h4 className="text-base font-semibold text-stone-900">{s.title}</h4>
                    {s.priceLabel ? (
                      <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">
                        {s.priceLabel}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">{s.description}</p>
                </article>
              ))
            )}
          </div>
        </section>
      ) : null}

      {tab === "flow" ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[var(--app-line)] bg-[var(--app-card)] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-900">Suas solicitações (contratando)</h3>
            <div className="mt-4 space-y-3">
              {sent.length === 0 ? (
                <p className="text-sm text-[var(--app-muted)]">Você ainda não solicitou serviços.</p>
              ) : (
                sent.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-stone-200 bg-stone-50/90 p-4">
                    <p className="text-sm font-semibold text-stone-900">{r.service.title}</p>
                    <p className="mt-1 text-xs text-[var(--app-muted)]">
                      Para: {r.provider?.name ?? r.provider?.email}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-stone-700">
                      Status:{" "}
                      <span className="text-teal-800">
                        {r.status === "PENDING"
                          ? "Pendente"
                          : r.status === "ACCEPTED"
                            ? "Aceita"
                            : "Recusada"}
                      </span>
                    </p>
                    {r.message ? (
                      <p className="mt-2 text-sm text-stone-600">&quot;{r.message}&quot;</p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--app-line)] bg-[var(--app-card)] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-900">Pedidos nos seus serviços</h3>
            <div className="mt-4 space-y-3">
              {received.length === 0 ? (
                <p className="text-sm text-[var(--app-muted)]">Nenhuma solicitação recebida.</p>
              ) : (
                received.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-stone-200 bg-stone-50/90 p-4">
                    <p className="text-sm font-semibold text-stone-900">{r.service.title}</p>
                    <p className="mt-1 text-xs text-[var(--app-muted)]">
                      De: {r.requester?.name ?? r.requester?.email}
                    </p>
                    {r.message ? (
                      <p className="mt-2 text-sm text-stone-600">&quot;{r.message}&quot;</p>
                    ) : null}
                    <p className="mt-2 text-xs font-semibold text-stone-700">
                      Status:{" "}
                      <span className="text-teal-800">
                        {r.status === "PENDING"
                          ? "Pendente"
                          : r.status === "ACCEPTED"
                            ? "Aceita"
                            : "Recusada"}
                      </span>
                    </p>
                    {r.status === "PENDING" ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void respondRequest(r.id, "ACCEPTED")}
                          className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                        >
                          Aceitar
                        </button>
                        <button
                          type="button"
                          onClick={() => void respondRequest(r.id, "DECLINED")}
                          className="rounded-2xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:border-stone-400"
                        >
                          Recusar
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
