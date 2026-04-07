import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/auth";
import { getAuthAppUrl } from "@/lib/auth-env";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "FOUNDER") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  let expiresAt: Date | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    const days = typeof body?.expiresInDays === "number" ? body.expiresInDays : null;
    if (days != null && days > 0 && days <= 365) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
    }
  } catch {
    expiresAt = null;
  }

  const token = randomBytes(24).toString("base64url");

  const row = await prisma.inviteToken.create({
    data: {
      token,
      createdById: session.user.id,
      expiresAt,
    },
  });

  const base =
    getAuthAppUrl() ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  const inviteUrl = base ? `${base}/register?token=${encodeURIComponent(row.token)}` : `/register?token=${encodeURIComponent(row.token)}`;

  return NextResponse.json({
    token: row.token,
    inviteUrl,
    expiresAt: row.expiresAt,
  });
}
