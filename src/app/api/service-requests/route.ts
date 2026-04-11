import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type SessionUser = { memberCommunityId: string | null; ownedCommunityId: string | null };

function userCommunityId(user: SessionUser) {
  return user.memberCommunityId ?? user.ownedCommunityId ?? null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const cid = userCommunityId(session.user);
  if (!cid) {
    return NextResponse.json({ error: "Indisponível para este usuário." }, { status: 403 });
  }

  const [sent, received] = await Promise.all([
    prisma.serviceRequest.findMany({
      where: {
        requesterId: session.user.id,
        service: { communityId: cid },
      },
      orderBy: { createdAt: "desc" },
      include: {
        service: { select: { id: true, title: true } },
        provider: { select: { name: true, email: true } },
      },
    }),
    prisma.serviceRequest.findMany({
      where: {
        providerId: session.user.id,
        service: { communityId: cid },
      },
      orderBy: { createdAt: "desc" },
      include: {
        service: { select: { id: true, title: true } },
        requester: { select: { name: true, email: true } },
      },
    }),
  ]);

  return NextResponse.json({ sent, received });
}
