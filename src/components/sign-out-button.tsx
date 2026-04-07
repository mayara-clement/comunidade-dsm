"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-xl bg-[var(--app-accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--app-accent-hover)]"
    >
      Sair
    </button>
  );
}
