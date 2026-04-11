/**
 * Auth.js v5 lê AUTH_SECRET; projetos antigos às vezes usam NEXTAUTH_SECRET.
 * AUTH_URL é o preferido na v5; NEXTAUTH_URL ainda funciona em muitos setups.
 */
export function getAuthSecret(): string | undefined {
  const s = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  return s && s.length > 0 ? s : undefined;
}

export function getAuthAppUrl(): string | undefined {
  const u = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  return u && u.length > 0 ? u.replace(/\/$/, "") : undefined;
}
