import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(15,118,110,0.14),transparent)]" />
      <div className="relative mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-4 py-16 sm:px-6">
        <p className="text-sm font-semibold tracking-wide text-teal-800/90">
          Comunidade acolhedora · acesso por convite
        </p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-stone-800 sm:text-5xl">
          Serviços com confiança, em um ambiente leve e respeitoso para todos.
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-stone-600 sm:text-lg">
          Um espaço privado onde fundadores acolhem novos membros e cada pessoa pode oferecer ou
          contratar serviços com clareza — simples, humano e aberto a quem quiser participar com
          respeito.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-teal-700 px-6 text-sm font-semibold text-white shadow-md shadow-teal-700/20 transition hover:bg-teal-800"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-stone-300/80 bg-white/90 px-6 text-sm font-semibold text-stone-800 shadow-sm backdrop-blur transition hover:border-teal-600/35 hover:text-teal-900"
          >
            Criar conta com convite
          </Link>
        </div>
      </div>
    </div>
  );
}
