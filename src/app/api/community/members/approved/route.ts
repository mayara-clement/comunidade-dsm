import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.ownedCommunityId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const community = await prisma.community.findFirst({
    where: {
      id: session.user.ownedCommunityId,
      ownerId: session.user.id,
      status: "ACTIVE",
    },
  });
  if (!community) {
    return NextResponse.json({ error: "Comunidade não encontrada ou inativa." }, { status: 403 });
  }

  const memberships = await prisma.communityMembership.findMany({
    where: {
      communityId: community.id,
      status: "APPROVED",
    },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  const members = memberships.map((m) => ({
    membershipId: m.id,
    userId: m.user.id,
    email: m.user.email,
    name: m.user.name,
  }));

  return NextResponse.json({ members });
}
