import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Metadados públicos do convite (para o formulário de cadastro saber quais campos exibir).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token")?.trim();
  if (!token || token.length < 8) {
    return NextResponse.json({ valid: false, error: "Token inválido." }, { status: 400 });
  }

  const invite = await prisma.inviteToken.findUnique({
    where: { token },
    include: {
      community: { select: { name: true, status: true } },
    },
  });

  if (!invite) {
    return NextResponse.json({ valid: false, error: "Convite não encontrado." });
  }
  if (invite.usedAt || invite.usedById) {
    return NextResponse.json({ valid: false, error: "Este convite já foi utilizado." });
  }
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: "Este convite expirou." });
  }

  if (invite.kind === "COMMUNITY_MEMBER") {
    if (!invite.community || invite.community.status !== "ACTIVE") {
      return NextResponse.json({
        valid: false,
        error: "Esta comunidade não está ativa para novos membros.",
      });
    }
  }

  return NextResponse.json({
    valid: true,
    kind: invite.kind,
    communityName: invite.community?.name ?? null,
  });
}
