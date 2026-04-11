import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.isPlatformFounder) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const community = await prisma.community.findUnique({ where: { id } });
  if (!community) {
    return NextResponse.json({ error: "Comunidade não encontrada." }, { status: 404 });
  }
  if (community.status === "REJECTED") {
    return NextResponse.json({ message: "Comunidade já estava rejeitada." });
  }

  await prisma.community.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  return NextResponse.json({ message: "Comunidade rejeitada." });
}
