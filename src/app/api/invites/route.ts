import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { auth } from "@/auth";
import { getAuthAppUrl } from "@/lib/auth-env";
import { prisma } from "@/lib/prisma";

const postBodySchema = z.object({
  expiresInDays: z.number().int().min(1).max(365).optional(),
  kind: z.enum(["NEW_COMMUNITY_OWNER", "COMMUNITY_MEMBER"]).optional(),
});

function buildInviteUrl(token: string) {
  const base =
    getAuthAppUrl() ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const path = `/register?token=${encodeURIComponent(token)}`;
  return base ? `${base}${path}` : path;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let expiresAt: Date | null = null;
  let kind: "NEW_COMMUNITY_OWNER" | "COMMUNITY_MEMBER" = "NEW_COMMUNITY_OWNER";

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = postBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    const days = parsed.data.expiresInDays;
    if (days != null) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
    }
    if (parsed.data.kind) {
      kind = parsed.data.kind;
    }
  } catch {
    expiresAt = null;
  }

  if (kind === "NEW_COMMUNITY_OWNER") {
    if (!session.user.isPlatformFounder) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }
  } else {
    if (!session.user.ownedCommunityId) {
      return NextResponse.json(
        { error: "Apenas donos de comunidade ativa podem convidar membros." },
        { status: 403 },
      );
    }
    const community = await prisma.community.findFirst({
      where: {
        id: session.user.ownedCommunityId,
        ownerId: session.user.id,
        status: "ACTIVE",
      },
    });
    if (!community) {
      return NextResponse.json(
        { error: "Sua comunidade precisa estar ativa para gerar convites." },
        { status: 403 },
      );
    }
  }

  const token = randomBytes(24).toString("base64url");

  const row = await prisma.inviteToken.create({
    data: {
      token,
      kind,
      createdById: session.user.id,
      communityId: kind === "COMMUNITY_MEMBER" ? session.user.ownedCommunityId : null,
      expiresAt,
    },
  });

  return NextResponse.json({
    token: row.token,
    kind: row.kind,
    inviteUrl: buildInviteUrl(row.token),
    expiresAt: row.expiresAt,
  });
}
