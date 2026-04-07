import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <Link href="/" className="mb-8 text-sm text-stone-500 hover:text-teal-800">
        ← Voltar
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-stone-800">Entrar</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        Use o email e a senha cadastrados após aprovação do fundador.
      </p>
      <Suspense fallback={<div className="mt-8 text-sm text-stone-500">Carregando…</div>}>
        <LoginForm />
      </Suspense>
      <p className="mt-8 text-center text-sm text-stone-600">
        Recebeu um convite?{" "}
        <Link href="/register" className="font-semibold text-teal-800 underline-offset-4 hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
