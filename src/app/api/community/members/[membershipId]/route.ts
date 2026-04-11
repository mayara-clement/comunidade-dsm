import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ membershipId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.ownedCommunityId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { membershipId } = await params;
  const membership = await prisma.communityMembership.findUnique({
    where: { id: membershipId },
    include: { community: true },
  });

  if (!membership || membership.communityId !== session.user.ownedCommunityId) {
    return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
  }
  if (membership.community.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  await prisma.communityMembership.delete({ where: { id: membershipId } });

  return NextResponse.json({ message: "Membro removido da comunidade." });
}
