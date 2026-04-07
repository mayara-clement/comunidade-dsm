import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "FOUNDER") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: {
      role: "MEMBER",
      membershipStatus: "PENDING",
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ members: users });
}
