import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.isPlatformFounder) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const communities = await prisma.community.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      owner: { select: { id: true, email: true, name: true } },
    },
  });

  return NextResponse.json({ communities });
}
