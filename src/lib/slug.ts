import { randomBytes } from "crypto";

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function uniqueCommunitySlug(baseName: string): string {
  const base = slugify(baseName) || "comunidade";
  const suffix = randomBytes(3).toString("hex");
  return `${base}-${suffix}`;
}
