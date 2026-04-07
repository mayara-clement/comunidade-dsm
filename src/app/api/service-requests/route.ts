import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const ok =
    session.user.membershipStatus === "APPROVED" &&
    (session.user.role === "MEMBER" || session.user.role === "FOUNDER");
  if (!ok) {
    return NextResponse.json({ error: "Indisponível para este usuário." }, { status: 403 });
  }

  const [sent, received] = await Promise.all([
    prisma.serviceRequest.findMany({
      where: { requesterId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        service: { select: { id: true, title: true } },
        provider: { select: { name: true, email: true } },
      },
    }),
    prisma.serviceRequest.findMany({
      where: { providerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        service: { select: { id: true, title: true } },
        requester: { select: { name: true, email: true } },
      },
    }),
  ]);

  return NextResponse.json({ sent, received });
}
